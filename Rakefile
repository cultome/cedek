$LOAD_PATH.unshift('./lib')

desc "Recreate database schema"
task :migrate => :environment do
  recreate_schema
end

desc "Run protractor e2e tests"
task :e2e => :environment do
  begin
    webdriver_pid = fork do
      system "webdriver-manager start"
    end

    sinatra_server_pid = fork do
      Rake::Task['run'].invoke
    end

    puts "[*] webdriver PID: #{webdriver_pid}"
    puts "[*] Sinatra Server PID: #{sinatra_server_pid}"
    puts "[*] Waiting for servers to finish starting up...."
    sleep 6
    # reseteamos la base de datos
    recreate_schema
    # corremos las pruebas
    success = system 'protractor spec/javascript/conf.js'
    # finalizamos los procesos
    Process.kill 'TERM', webdriver_pid
    Process.kill 'TERM', sinatra_server_pid
    Process.wait webdriver_pid
    Process.wait sinatra_server_pid
    puts "[*] Waiting to shut down cleanly........."
    sleep 5
  rescue Exception => e
    puts e
    Rake::Task['killall'].invoke
  ensure
    Rake::Task['killall'].invoke
    exit success
  end
end

desc "Run sinatra app"
task :run => :environment do
  Cedek::App.send(:run!, {port: 4567})
end

desc "Run interatively"
task :console => :environment do
  require 'irb'
  require 'irb/completion'
  ARGV.clear
  IRB.start
end

desc "Backup database"
task :backup do
  require 'time'

  dest_file = "backup/db_backup_#{Time.now.to_s.gsub(" ", "_")}.db"
  cp "db/app.db", dest_file
end

desc "Initialize the dependencies"
task :resources do
  system "npm install"
  system "./node_modules/grunt-cli/bin/grunt"
end

task :killall do
  system "ps aux | grep -ie '-Dwebdriver' | awk '{print $2}' | xargs kill -9"
  system "ps aux | grep -ie 'node /usr/bin/protractor spec/javascript/conf.js' | awk '{print $2}' | xargs kill -9"
  system "ps aux | grep -ie 'rake run' | awk '{print $2}' | xargs kill -9"
end

task :environment do
  ENV["RACK_ENV"] = ENV["RACK_ENV"] || "development"
  puts "[*] Running in #{ENV["RACK_ENV"]} environment."

  require 'cedek'

  include Cedek::Model
  include Cedek::Utils

end

task :default => :run
