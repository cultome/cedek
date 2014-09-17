require 'cedek'

include Cedek::Model
include Cedek::Utils

namespace :db do
  desc "Recreate database schema"
  task :reset do
    recreate_schema
  end
end

namespace :test do
  desc "Run protractor e2e tests"
  task :e2e do
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
      Rake::Task['test:killall'].invoke
    ensure
      Rake::Task['test:killall'].invoke
      exit success
    end
  end

  task :killall do
    system "ps aux | grep -ie '-Dwebdriver' | awk '{print $2}' | xargs kill -9"
    system "ps aux | grep -ie 'node /usr/bin/protractor spec/javascript/conf.js' | awk '{print $2}' | xargs kill -9"
    system "ps aux | grep -ie 'ruby /home/csoria/.rvm/rubies/default/bin/rake run' | awk '{print $2}' | xargs kill -9"
  end
end

desc "Run sinatra app"
task :run do
  Cedek::App.send(:run!)
end

desc "Prepare and start the system"
task :setup do
  system "grunt"
  Rake::Task['run'].invoke
  system "rm -fr build/ public/"
end

desc "Run interatively"
task :console do
  require 'irb'
  require 'irb/completion'
  ARGV.clear
  IRB.start
end

task :default => :run
