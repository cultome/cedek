require 'active_record'

module Cedek
	module Utils

		ActiveRecord::Base.include_root_in_json = false

		def recreate_schema
			#with_connection do
				begin
					ActiveRecord::Schema.drop_table('scholarships')
					ActiveRecord::Schema.drop_table('debts')
					ActiveRecord::Schema.drop_table('courses_people')
					ActiveRecord::Schema.drop_table('sessions')
					ActiveRecord::Schema.drop_table('attendances')
					ActiveRecord::Schema.drop_table('people')
					ActiveRecord::Schema.drop_table('courses')
					ActiveRecord::Schema.drop_table('phones')
					ActiveRecord::Schema.drop_table('phone_types')
					ActiveRecord::Schema.drop_table('consults')
					ActiveRecord::Schema.drop_table('marital_statuses')
					ActiveRecord::Schema.drop_table('leaders')
					ActiveRecord::Schema.drop_table('users')
					ActiveRecord::Schema.drop_table('user_types')
				rescue
				end

				begin
					ActiveRecord::Schema.define do
						create_table :people do |t|
							t.string :name
							t.date :birthday
              t.string :job
              t.references :marital_status
							t.string :address
							t.string :email
							t.boolean :lead_pray_group
							t.boolean :has_scholarship
							t.integer :scholarship_percentage
						end

						create_table :courses do |t|
							t.string :name
							t.string :code
							t.date :begin
							t.date :end
							t.time :hour
							t.integer :day
							t.decimal :cost
						end

						create_table :phone_types do |t|
							t.string :name
						end

						create_table :phones do |t|
							t.references :person
							t.references :phone_type
							t.string :number
						end

						create_table :courses_people do |t|
							t.references :person
							t.references :course
						end

						create_table :scholarships do |t|
							t.references :person
							t.references :course
							t.integer :percentage
						end

						create_table :debts do |t|
							t.references :person
							t.references :course
							t.decimal :amount
							t.date :commitment
						end

						create_table :sessions do |t|
							t.references :course
							t.date :session_date
						end

						create_table :attendances do |t|
							t.references :session
							t.references :person
						end

            create_table :leaders do |t|
              t.string :name
            end

            create_table :consults do |t|
              t.references :leader
              t.references :person
              t.date :consult_date
              t.string :drops
              t.string :reason
              t.string :diagnostic
              t.string :treatment
            end

            create_table :marital_statuses do |t|
              t.string :name
            end

            create_table :users do |t|
              t.string :username
              t.string :password
              t.string :name
              t.references :user_type
            end

            create_table :user_types do |t|
              t.string :name
            end

					end
				rescue ActiveRecord::StatementInvalid
				end

        MaritalStatus.create!(name: "Solter@")
        MaritalStatus.create!(name: "Casad@")
        MaritalStatus.create!(name: "Divorciad@")
        MaritalStatus.create!(name: "Viud@")
        MaritalStatus.create!(name: "Otro")

				PhoneType.create(id: 1, name: "Casa")
				PhoneType.create(id: 2, name: "Movil")
				PhoneType.create(id: 3, name: "Oficina")

        UserType.create!(id: 1, name: "Administrador")
        UserType.create!(id: 2, name: "Regular")

        User.create!(username: "admin", password: Digest::SHA1.hexdigest("admin"), name: "Administrador", user_type_id: 1)

        return true
			#end
		end # recreate_schema

    def fixtures
      #return with_connection do
				s1 = Person.create!(id: 1, name: "Susana Alvarado", birthday: Time.new(1983, 10, 2), address: "Av Iman 580, Coyoacan, D.F.", email: "susana@gmail.com", lead_pray_group: true, has_scholarship: true, scholarship_percentage: 75)
				s2 = Person.create!(id: 2, name: "Noel Soria", birthday: Time.new(2010, 3, 1), address: "Av Iman 580, Coyoacan, D.F.", email: "noel@gmail.com", lead_pray_group: false, has_scholarship: false, scholarship_percentage: 0)
				s3 = Person.create!(id: 3, name: "Carlos Soria", birthday: Time.new(1983, 9, 10), address: "Av Iman 580, Coyoacan, D.F.", email: "carlos@gmail.com", lead_pray_group: false, has_scholarship: true, scholarship_percentage: 50)
				s4 = Person.create!(id: 4, name: "Alfredo Alvarado", birthday: Time.new(1987, 9, 10), address: "Cerquita de la diana", email: "alfredo@gmail.com", lead_pray_group: true, has_scholarship: false, scholarship_percentage: 0)
				s5 = Person.create!(id: 5, name: "Paloma Alvarado", birthday: Time.new(1981, 9, 11), address: "Con el compadre", email: "paloma@gmail.com", lead_pray_group: true, has_scholarship: true, scholarship_percentage: 25)

				c1 = Course.create!(id: 1, name: "Curso I", code: "CUR1", begin: Time.now, end: Time.now + 60*60*24*160, hour: Time.now, day: 0, cost: 300)
				c2 = Course.create!(id: 2, name: "Curso II", code: "CUR2", begin: Time.now, end: Time.now + 60*60*24*360, hour: Time.now, day: 1, cost: 250)
				c3 = Course.create!(id: 3, name: "Homeopatia", code: "HOM-JU", begin: Time.now, end: Time.now + 60*60*24*180, hour: Time.now, day: 2, cost: 200)
				c4 = Course.create!(id: 4, name: "Taller Homeopatia", code: "THOM-VI", begin: Time.now, end: Time.now + 60*60*24*8, hour: Time.now, day: 3, cost: 150)
				c5 = Course.create!(id: 5, name: "Esperanto", code: "ESP-SA", begin: Time.now + 60*60*24*30, end: Time.now + 60*60*24*60, hour: Time.now, day: 4, cost: 100)
				c6 = Course.create!(id: 6, name: "Biomagnetismo", code: "BIO-MIE", begin: Time.now + 60*60*24*8, end: Time.now + 60*60*24*16, hour: Time.now, day: 5, cost: 50)

				s2.scholarships << Scholarship.create!(id: 1, course_id: 2, percentage: 10)
				s2.scholarships << Scholarship.create!(id: 2, course_id: 3, percentage: 50)
				s4.scholarships << Scholarship.create!(id: 3, course_id: 1, percentage: 25)
				s4.scholarships << Scholarship.create!(id: 4, course_id: 4, percentage: 30)

				s1.debts << Debt.create!(id: 1, course_id: 2, amount: 100)
				s2.debts << Debt.create!(id: 2, course_id: 4, amount: 50, commitment: Time.now)
				s3.debts << Debt.create!(id: 3, course_id: 5, amount: 150, commitment: Time.now)

				s1.phones << Phone.create!(id: 1, phone_type_id: 1, number: "56074335")
				s1.phones << Phone.create!(id: 2, phone_type_id: 2, number: "17983456")
				s2.phones << Phone.create!(id: 3, phone_type_id: 1, number: "56074335")
				s3.phones << Phone.create!(id: 4, phone_type_id: 1, number: "56074335")
				s3.phones << Phone.create!(id: 5, phone_type_id: 2, number: "179876764")

				c1.students << s1 << s2 << s3 << s4 << s5
				c2.students << s1 << s2 << s3 << s4
				c3.students << s1 << s4 << s5
				c4.students << s5
				c5.students << s4 << s5
				c6.students << s1 << s2 << s5

				c1.sessions << Session.create!(id: 1, session_date: Time.now)
				c1.sessions << Session.create!(id: 2, session_date: Time.now + 60*60*24*8)
				c2.sessions << Session.create!(id: 3, session_date: Time.now + 60*60*24*2)
				c2.sessions << Session.create!(id: 4, session_date: Time.now + 60*60*24*10)
				c3.sessions << Session.create!(id: 5, session_date: Time.now + 60*60*24*3)
				c3.sessions << Session.create!(id: 6, session_date: Time.now + 60*60*24*8)
				c4.sessions << Session.create!(id: 7, session_date: Time.now + 60*60*24*4)
				c4.sessions << Session.create!(id: 8, session_date: Time.now + 60*60*24*11)
				c5.sessions << Session.create!(id: 9, session_date: Time.now + 60*60*24*5)
				c5.sessions << Session.create!(id: 10, session_date: Time.now + 60*60*24*12)
				c6.sessions << Session.create!(id: 11, session_date: Time.now + 60*60*24*6)
				c6.sessions << Session.create!(id: 12, session_date: Time.now + 60*60*24*8)

				Attendance.create!(session_id: 1, person_id: 1)
				Attendance.create!(session_id: 2, person_id: 1)
				Attendance.create!(session_id: 1, person_id: 2)
				Attendance.create!(session_id: 2, person_id: 2)
				Attendance.create!(session_id: 1, person_id: 3)
				Attendance.create!(session_id: 2, person_id: 3)
				Attendance.create!(session_id: 1, person_id: 4)
				Attendance.create!(session_id: 2, person_id: 5)

				Attendance.create!(session_id: 3, person_id: 1)
				Attendance.create!(session_id: 4, person_id: 1)
				Attendance.create!(session_id: 4, person_id: 2)
				Attendance.create!(session_id: 3, person_id: 3)
				Attendance.create!(session_id: 4, person_id: 3)
				Attendance.create!(session_id: 3, person_id: 4)

				Attendance.create!(session_id: 5, person_id: 1)
				Attendance.create!(session_id: 6, person_id: 1)
				Attendance.create!(session_id: 5, person_id: 4)
				Attendance.create!(session_id: 6, person_id: 4)
				Attendance.create!(session_id: 5, person_id: 5)
				Attendance.create!(session_id: 6, person_id: 5)

				Attendance.create!(session_id: 7, person_id: 5)
				Attendance.create!(session_id: 8, person_id: 5)

				Attendance.create!(session_id: 10, person_id: 4)
				Attendance.create!(session_id: 9, person_id: 5)

				Attendance.create!(session_id: 11, person_id: 2)
				Attendance.create!(session_id: 12, person_id: 5)

        Leader.create!(id: 1, name: "Guia 1")
        Leader.create!(id: 2, name: "Guia 2")
        Leader.create!(id: 3, name: "Guia 3")

        Consult.create!(id: 1, leader_id: 1, person_id: 1, consult_date: Time.now - 60*60*24*86, drops: "bl-am", reason: "Razon 1", diagnostic: "Diagnostico 1", treatment: "Tratamiento 1")
        Consult.create!(id: 2, leader_id: 2, person_id: 1, consult_date: Time.now - 60*60*24*54, drops: "rj-vr", reason: "Razon 2", diagnostic: "Diagnostico 2", treatment: "Tratamiento 2")
        Consult.create!(id: 3, leader_id: 1, person_id: 1, consult_date: Time.now - 60*60*24*23, drops: "rs", reason: "Razon 3", diagnostic: "Diagnostico 3", treatment: "Tratamiento 3")
        Consult.create!(id: 4, leader_id: 1, person_id: 2, consult_date: Time.now - 60*60*24*59, drops: "vr-rs", reason: "Razon 1", diagnostic: "Diagnostico 1", treatment: "Tratamiento 1")
        Consult.create!(id: 5, leader_id: 3, person_id: 1, consult_date: Time.now - 60*60*24*10, drops: "bl-am", reason: "Razon 4", diagnostic: "Diagnostico 4", treatment: "Tratamiento 4")
        Consult.create!(id: 6, leader_id: 1, person_id: 1, consult_date: Time.now - 60*60*24*1, drops: "rj-vr-rs-am-bl", reason: "Razon 5", diagnostic: "Diagnostico 5", treatment: "Tratamiento 5")

      #end
    end # fixtures

	end
end
