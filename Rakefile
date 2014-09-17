require 'cedek'

include Cedek::Model
include Cedek::Utils

namespace :db do
  desc "Recreate database schema"
  task :reset do
    recreate_schema
  end
end

desc "Run sinatra app"
task :run do
  Cedek::App.send(:run!)
end

task :default => :run
