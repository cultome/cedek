require "cedek/version"
require 'sinatra/base'
require 'cedek/model'
require 'cedek/utils'
require 'json'

module Cedek
	class App < Sinatra::Base

		include Cedek::Model
		include Cedek::Utils

		configure do
      set :public_folder, File.dirname(__FILE__) + '/../public'
		end

    get '/' do
      redirect '/index.html'
    end

		put '/people/:personId' do |personId|
			return with_connection do
        student = Person.find(personId)
        student_attrs = JSON.parse request.body.read
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
    end

		put '/courses/:courseId' do |courseId|
			return with_connection{
        props = JSON.parse request.body.read
				course = Course.find(courseId)
        return course.update_attributes(props)
			}
		end

    post '/consults/:personId' do |personId|
      body = request.body.read
      puts "body: #{body}"
    end

    # refactor this method
		post '/courses/:courseId/:action/:actionId' do |courseId, action, actionId|
      body = request.body.read
      unless body.empty?
        req = JSON.parse body
      end

			case action
			when "scholarship" then
        return with_connection do
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
        end

			when "subscribe" then
        return with_connection do
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
        end

			when "attendance" then
        return with_connection do
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
    end

    post '/courses' do
      return with_connection do
        course = JSON.parse request.body.read
        return Course.create!(course).to_json(only: :id, methods: [:persisted?])
      end
    end

		post '/people' do
      return with_connection do
        student = JSON.parse request.body.read
        student["phones"] = student["phones"].map{|p| Phone.new(p) }
        return Person.create!(student).to_json(only: :id, methods: [:persisted?])
      end
		end

    post '/debts/pay' do
      with_connection do
        debt = JSON.parse request.body.read
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
    end

    post '/debts/later' do
      with_connection do
        debt = JSON.parse request.body.read
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
    end

		get '/people/:personId' do |personId|
      return with_connection do
        Person.find(personId).to_json(include: {
          phones: { only: [:id, :number, :phone_type_id] },
          scholarships: { only: [:course_id, :id, :percentage], methods: [:course_name] },
          enrollments: { only: [:id, :name] },
          reserves: { only: [:id, :name] },
          previous: { only: [:id, :name] },
          debts: { only: [:id, :amount, :commitment, :course_id, :person_id], methods: [:person_name, :course_name] }
        })
      end
		end

    get '/people' do

      return with_connection do
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
    end

		get '/courses/:courseId/students/:studentId' do |courseId, studentId|
			return with_connection do
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
		end

		get '/courses/:courseId/:action' do |courseId, action|
			case action
			when "students" then
				return with_connection{ Course.find(courseId).students.to_json(only: [:id, :name]) }
			when "debts" then
				return with_connection{ Course.find(courseId).debts.to_json(only: [:id, :amount, :commitment, :person_id, :course_id], methods: [:person_name]) }
			when "scholarships" then
				return with_connection{ Course.find(courseId).scholarships.to_json(only: [:id, :percentage, :person_id, :course_id], methods: [:student_name]) }
			when "sessions" then
				return with_connection{ Course.find(courseId).sessions.to_json(only: [:id, :session_date]) }
			when "attendance" then
				return "Necesitas especificar una fecha de sesion." if params[:date].nil?
				return "Formato invalido para fecha. [yyyy-mm-dd]" unless params[:date] =~ /^([\d]{4})-([\d]{1,2})-([\d]{1,2})$/
				session_date = Date.new($1.to_i, $2.to_i, $3.to_i)

				return with_connection do
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
		end

		get '/courses/:courseId' do |courseId|
			return with_connection{
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
			}
		end

		get '/courses' do
      return with_connection do
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
		end

		get '/catalogs/:catalogId' do |catalogId|
			case catalogId
			when "phone" then
				return with_connection{ PhoneType.all.to_json }
			end
		end

    delete '/scholarship/:scholarshipId' do |scholarshipId|
      with_connection do
        Scholarship.delete(scholarshipId)
				return true
      end
    end

    delete '/debts/remove/:debtId' do |debtId|
      with_connection do
        Debt.delete(debtId)
				return true
      end
    end

    delete '/courses/:courseId/unroll/:studentId' do |courseId, studentId|
      with_connection do
        course = Course.find(courseId)
        raise "El curso no existe!" if course.nil?
        student = course.students.find(studentId)
        raise "El estudiante no existe!" if student.nil?
        course.students.delete(student)

				return true
      end
    end

	end
end
