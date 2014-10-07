require "cedek/version"
require 'sinatra/base'
require 'cedek/model'
require 'cedek/utils'
require 'json'
require 'digest'

module Cedek
  class App < Sinatra::Base

    include Cedek::Model
    include Cedek::Utils

    configure do
      set :public_folder, File.dirname(__FILE__) + '/../public'
      set :show_exceptions, false

      db_config = {
        'development' => {
          adapter: 'sqlite3',
          database: 'db/app.db'
        },
        'test' => {
          adapter: 'sqlite3',
          database: 'db/app.db'
        },
        'production' => {
          adapter: 'mysql2',
          database: 'cedek',
          host: '127.0.0.1',
          username: 'cedek',
          password: 'cedek',
          encoding: 'utf8'
        }
      }[ENV["RACK_ENV"]]

      puts "[*] Connecting to #{db_config[:database]} databse."

      ActiveRecord::Base.establish_connection(db_config)
    end

    before do
      ActiveRecord::Base.connection_pool.connection
    end

    after do
      ActiveRecord::Base.connection_pool.release_connection
    end

    error do
      status 400
      return env['sinatra.error'].message
    end

    get '/' do
      redirect '/index.html'
    end

    put '/users/:userId' do |userId|
      req = get_body
      raise "El nombre de usuario ya existe" if User.where("username = ?", req["username"]).count > 1
      user = User.find(userId)
      raise "La contraseña es incorrecta" unless user.password == Digest::SHA1.hexdigest(req["currentPassword"])
      # quitamos los campos que no van
      req.delete("id")
      req.delete("password")
      req.delete("currentPassword")
      # actualizamos
      return user.update_attributes(req)
    end

    put '/auth/:userId' do |userId|
      req = get_body
      user = User.find(userId)
      raise "El usuario no existe" if user.nil?
      raise "Contraseña actual incorrecta" unless user.password == Digest::SHA1.hexdigest(req["currentPassword"])
      user.password = Digest::SHA1.hexdigest(req["newPassword"])
      return user.save
    end

    put '/people/:personId' do |personId|
      student = Person.find(personId)
      student_attrs = get_body
      phone_attrs = student_attrs.delete("phones")
      phone_attrs.each do |phone|
        if phone["id"].nil?
          unless phone["number"].empty?
            student.phones << Phone.create!(phone)
          end
        else
          Phone.find(phone["id"].to_i).update_attributes(phone)
        end
      end
      student.update_attributes(student_attrs)
    end

    put '/courses/:courseId' do |courseId|
      props = get_body
      course = Course.find(courseId)
      return course.update_attributes(props)
    end

    post '/auth' do
      req = get_body
      user = User.where("username = ?", req["username"]).first
      raise "El usuario no existe" if user.nil?
      passwd = Digest::SHA1.hexdigest(req["password"])
      raise "La contraseña es invalida" unless user.password == passwd
      return user.to_json(only: [:id, :username, :name, :user_type_id], methods: [:user_type_name])
    end

    post '/users' do
      req = get_body
      raise "El nombre de usuario ya existe" unless User.where("username = ?", req["username"]).first.nil?
      req["password"] = Digest::SHA1.hexdigest(req["password"])
      # liminamos los datos que no van
      req.delete("password_confirm")
      # creamos
      user = User.create!(req)
      return user.to_json(only: [:id, :username, :name, :user_type_id], methods: [:user_type_name])
    end

    post '/consults/:personId' do |personId|
      req = get_body
      drops = req["drops"].collect{|arr| arr[1] ? arr[0] : nil }.compact.join("-")
      req["drops"] = drops
      consult = Consult.create!(req)
      return consult.persisted?
    end

    # refactor this method
    post '/courses/:courseId/:action/:actionId' do |courseId, action, actionId|
      req = get_body
      case action
      when "scholarship" then
        course = Course.find(courseId.to_i)
        raise "El curso no existe!" if course.nil?
        student = Person.find(actionId.to_i)
        raise "El estudiante no existe!" if student.nil?
        amount = req["amount"].to_f
        raise "Porcentage invalido!" if amount < 0 || amount > 100

        scholarships = course.scholarships.select{|s| s.student == student }
        if scholarships.empty?
          Scholarship.create!(course: course, person_id: student.id, percentage: amount)
          return true

        else
          scholarships[0].percentage = amount
          return scholarships[0].save

        end

      when "subscribe" then
        course = Course.find(courseId)
        raise "El curso no existe!" if course.nil?
        student = Person.find(actionId)
        raise "El estudiante no existe!" if student.nil?
        if course.students.include?(student)
          puts "El estudiante ya esta registrado en el curso."
        else
          course.students << student
        end

        return true

      when "attendance" then
        course = Course.find(courseId.to_i)
        raise "El curso no existe!" if course.nil?
        student = Person.find(actionId.to_i)
        raise "El estudiante no existe!" if student.nil?
        session_date = Time.new(*req["sessionDate"].split("-"))

        session = Session.where(course_id: course.id).select{|s| s.session_date == session_date.to_date }.first
        if session.nil?
          session = Session.create!(course_id: course.id, session_date: session_date)
        end

        Attendance.where(person_id: student.id, session_id: session.id).first_or_create!

        return true
      end
    end

    post '/courses' do
      course = get_body
      return Course.create!(course).to_json(only: :id, methods: [:persisted?])
    end

    post '/people' do
      student = get_body
      student["phones"] = student["phones"].map{|p| Phone.new(p) }
      return Person.create!(student).to_json(only: :id, methods: [:persisted?])
    end

    post '/debts/pay' do
      debt = get_body
      student_id = debt["studentId"].to_i
      course_id = debt["courseId"].to_i
      amount = debt["amount"].to_f
      payment = debt["payment"].to_f

      debt = Debt.where(person_id: student_id, course_id: course_id).first
      if debt.nil?
        if amount - payment > 0
          return Debt.create!(person_id: student_id, course_id: course_id, amount: amount - payment)
        end
      else
        debt.amount -= payment
        if debt.amount <= 0
          return debt.delete
        else
          return debt.save
        end
      end

      return false
    end

    post '/debts/later' do
      debt = get_body
      student_id = debt["studentId"].to_i
      course_id = debt["courseId"].to_i
      amount = debt["amount"].to_f
      commitment = Time.new(*debt["date"].split("-"))
      add_amount = debt["charge"]

      debt = Debt.where(person_id: student_id, course_id: course_id).first
      if debt.nil?
        return Debt.create!(person_id: student_id, course_id: course_id, amount: amount, commitment: commitment)
      else
        props = { commitment: commitment }
        props[:amount] = debt.amount + amount if add_amount
        success = debt.update_attributes(props)
        return success
      end
    end

    get '/users/:userId' do |userId|
      user = User.find(userId)
      raise "El usuario no existe!" if user.nil?
      return user.to_json(only: [:id, :username, :name, :user_type_id], methods: [:user_type_name])
    end

    get '/consults/:personId' do |personId|
      consults = Consult.by_person(personId)

      if params["recent"]
        consults = consults.limit(5)
      end

      return consults.to_json(methods: [:leader_name, :person_name, :opts])
    end

    get '/people/:personId' do |personId|
      Person.find(personId).to_json( methods: [:marital_status_name], include: {
        phones: { only: [:id, :number, :phone_type_id] },
        scholarships: { only: [:course_id, :id, :percentage], methods: [:course_name] },
        enrollments: { only: [:id, :name] },
        reserves: { only: [:id, :name] },
        previous: { only: [:id, :name] },
        debts: { only: [:id, :amount, :commitment, :course_id, :person_id], methods: [:person_name, :course_name] }
      })
    end

    get '/users' do
      return User.all.to_json(only: [:id, :username, :name, :user_type_id], methods: [:user_type_name])
    end

    get '/people' do
      if params.empty?
        Person.all.to_json(include: {
          phones: { only: [:id, :number, :phone_type_id] },
          scholarships: { only: [:course_id, :id, :percentage], methods: [:course_name] },
          enrollments: { only: [:id, :name] },
          reserves: { only: [:id, :name] },
          previous: { only: [:id, :name] },
          debts: { only: [:id, :amount, :commitment, :course_id, :person_id], methods: [:person_name, :course_name] }
        })

      else
        # crear criterio para diferentes fechas
        date = Time.now.to_date

        Person.all.select{|s| s.birthday.month == date.month && s.birthday.day == date.day}.to_json(include: {
          phones: { only: [:id, :number, :phone_type_id] },
          scholarships: { only: [:course_id, :id, :percentage], methods: [:course_name] },
          enrollments: { only: [:id, :name] },
          reserves: { only: [:id, :name] },
          previous: { only: [:id, :name] },
          debts: { only: [:id, :amount, :commitment, :course_id, :person_id], methods: [:person_name, :course_name] }
        })

      end
    end

    get '/courses/:courseId/students/:studentId' do |courseId, studentId|
      course = Course.find(courseId)
      student = Person.find(studentId)
      if course.students.include?(student)
        student.unattendance = course.sessions.select{|s| !s.people.include?(student) }
        student.to_json(include: {
          scholarships: { only: [:course_id, :id, :percentage], methods: [:course_name] },
          enrollments: { only: [:id, :name] },
          debts: { only: [:id, :amount, :commitment, :course_id, :person_id], methods: [:person_name, :course_name] },
          unattendance: {}
        })
      else
        "Estudiante no registrado en este curso."
      end
    end

    get '/courses/:courseId/:action' do |courseId, action|
      case action
      when "students" then
        return Course.find(courseId).students.to_json(only: [:id, :name])
      when "debts" then
        return Course.find(courseId).debts.to_json(only: [:id, :amount, :commitment, :person_id, :course_id], methods: [:person_name])
      when "scholarships" then
        return Course.find(courseId).scholarships.to_json(only: [:id, :percentage, :person_id, :course_id], methods: [:student_name])
      when "sessions" then
        return Course.find(courseId).sessions.to_json(only: [:id, :session_date])
      when "attendance" then
        return "Necesitas especificar una fecha de sesion." if params[:date].nil?
        return "Formato invalido para fecha. [yyyy-mm-dd]" unless params[:date] =~ /^([\d]{4})-([\d]{1,2})-([\d]{1,2})$/
        session_date = Date.new($1.to_i, $2.to_i, $3.to_i)

        course = Course.find(courseId)
        raise "El curso no existe!" if course.nil?
        session = Session.where(course_id: course.id).select{|s| s.session_date == session_date }.first
        return [] if session.nil?

        students = course.students.map do |s|
          s.attend = session.people.include?(s)
          s
        end

        students.to_json(only: [:id, :name], methods: :attend)
      end
    end

    get '/courses/:courseId' do |courseId|
      course = Course.find(courseId)
      course.students.each do |s|
        if s.has_scholarship
          s.price = course.cost - course.cost * s.scholarship_percentage / 100
        end

        scholarship = Scholarship.where(course_id: course.id, person_id: s.id).first
        if scholarship.nil?
          if !s.has_scholarship
            s.price = course.cost
          end
        else
          s.price = course.cost - course.cost * scholarship.percentage / 100
        end
      end

      return course.to_json(
        only: [:id, :code, :name, :begin, :end, :day, :cost, :hour],
        methods: [:schedule],
        include: {
          students: { only: [:id, :name], methods: [:price] }
        })
    end

    get '/courses' do
      if params.empty?
        Course.all.to_json(only: [:id, :code, :name, :begin, :end, :cost], methods: [:schedule])

      else
        if params["today"]
          Course.active.where("day = ?", Time.now.wday).to_json(only: [:id, :name, :hour])
        elsif params["active"]
          Course.active.to_json(only: [:id, :name, :hour]) 
        elsif params["coming"]
          Course.opened.to_json(only: [:id, :name], methods: [:status])
        elsif params["open"]
          Course.can_subscribe.to_json(only: [:id, :name], methods: [:status])
        end

      end
    end

    get '/catalogs/:catalogId' do |catalogId|
      case catalogId
      when "phone" then
        return PhoneType.all.to_json
      when "leaders" then
        return Leader.all.to_json
      when "maritalStatus" then
        return MaritalStatus.all.to_json
      when "userType" then
        return UserType.all.to_json
      end
    end

    delete '/scholarship/:scholarshipId' do |scholarshipId|
      Scholarship.delete(scholarshipId)
      return true
    end

    delete '/debts/remove/:debtId' do |debtId|
      Debt.delete(debtId)
      return true
    end

    delete '/courses/:courseId/unroll/:studentId' do |courseId, studentId|
      course = Course.find(courseId)
      raise "El curso no existe!" if course.nil?
      student = course.students.find(studentId)
      raise "El estudiante no existe!" if student.nil?
      course.students.delete(student)

      return true
    end

    def get_body(required=true)
      body = request.body.read
      raise "Falta informacion requerida" if required && body.empty?
      req = JSON.parse body
      return req
    end

  end
end
