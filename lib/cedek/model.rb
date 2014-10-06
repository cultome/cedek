require 'active_record'

module Cedek
	module Model
		class Course < ActiveRecord::Base
			has_and_belongs_to_many :students, class_name: "Person"
			scope :can_subscribe, ->{ where("? between begin and end or begin > ?", Time.now, Time.now) }
			scope :active, ->{ where("? between begin and end", Time.now) }
			scope :closed, ->{ where("end < ?", Time.now) }
			scope :opened, ->{ where("begin > ?", Time.now) }

			has_many :scholarships
			has_many :debts
			has_many :sessions

			def schedule
				"#{ week_day(self.day) } #{ self.hour.hour.to_s.rjust(2, "0") }:#{ self.hour.min.to_s.rjust(2, "0") }"
			end

			def status
				return "Cerrado" if Time.now > self.end
				return "Abierto" if Time.now < self.begin
				return "En Curso"
			end

      def week_day(idx)
        case idx
        when 0 then return "Domingo"
        when 1 then return "Lunes"
        when 2 then return "Martes"
        when 3 then return "Miercoles"
        when 4 then return "Jueves"
        when 5 then return "Viernes"
        when 6 then return "Sabado"
        end
      end
    end

		class Debt < ActiveRecord::Base
			belongs_to :person
			belongs_to :course

			def course_name
				return course.name
			end

			def person_name
				return person.name
			end
		end

		class Phone < ActiveRecord::Base
			belongs_to :phone_type
		end

		class MaritalStatus < ActiveRecord::Base
      has_many :people
		end

		class PhoneType < ActiveRecord::Base
			has_many :phones
		end

		class Scholarship < ActiveRecord::Base
			belongs_to :person
			belongs_to :course

      def student
        return person
      end

			def course_name
				return course.name
			end

			def student_name
				return student.name
			end
		end

		class Session < ActiveRecord::Base
			belongs_to :course
			has_many :attendances
			has_many :people, :through => :attendances

      def students
        return people
      end
		end

		class Attendance < ActiveRecord::Base
			belongs_to :session
			belongs_to :person
			has_one :course, :through => :sessions

      def student
        return person
      end
		end

		class UserType < ActiveRecord::Base
    end

		class User < ActiveRecord::Base
      belongs_to :user_type
    end

		class Person < ActiveRecord::Base
			has_and_belongs_to_many :courses
      belongs_to :marital_status
			has_many :phones
			has_many :scholarships
			has_many :debts
			has_many :sessions, :through => :attendances

			attr_accessor :unattendance
			attr_accessor :attend
			attr_accessor :price

			def enrollments
				courses.active.to_a
			end

			def reserves
				courses.opened.to_a
			end

			def previous
				courses.closed.to_a
			end

      def marital_status_name
        marital_status.name unless marital_status.nil?
      end
		end

    class Consult < ActiveRecord::Base
      belongs_to :leader
      belongs_to :person

      scope :by_person, ->(personId){ where("person_id = ?", personId).order('id desc') }

      def leader_name
        return leader.name
      end

      def person_name
        return person.name
      end

      def opts
        return "" if self.drops.empty?
        return self.drops.split("-").reduce({}){|acc, opc| acc[opc] = true; acc }
      end

    end

    class Leader < ActiveRecord::Base
    end

	end
end
