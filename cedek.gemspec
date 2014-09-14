# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'cedek/version'

Gem::Specification.new do |spec|
  spec.name          = "cedek"
  spec.version       = Cedek::VERSION
  spec.authors       = ["Carlos Soria"]
  spec.email         = ["cultome@gmail.com"]
  spec.summary       = %q{CEDEK}
  spec.description   = %q{CEDEK}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_runtime_dependency "sinatra"
  spec.add_runtime_dependency "activerecord"
  spec.add_runtime_dependency "sqlite3"
  spec.add_runtime_dependency "rerun"

  spec.add_development_dependency "bundler", "~> 1.6"
  spec.add_development_dependency "rake"
end
