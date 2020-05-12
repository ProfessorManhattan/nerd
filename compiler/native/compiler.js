/*
 * This file is part of NectarJS
 * Copyright (c) 2017-2020 Adrien THIERRY
 * http://nectarjs.com - https://www.linkedin.com/in/adrien-thierry-fr/
 *
 * sources : https://github.com/nectarjs/nectarjs/
 *
 * this program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * You can be released from the requirements of the license by purchasing
 * a commercial license. Buying such a license is mandatory as soon as you
 * develop commercial activities involving the NectarJS software without
 * disclosing the source code of your own applications. Visit http://seraum.com/
 * and feel free to contact us.
 *
 */
global.babel = require( '@babel/core' );
babel.generate = require( '@babel/generator' ).default;

 var visitor = require("./visitor/visitor.js");
 
var genRequire = require("./lib/genRequire.js");

global.RND = function() { return "__" + Math.random().toString(36).substring(7); };

global.ENV = loadEnv();
function loadEnv()
{
	var _res = {};
	var _folder = path.join(__dirname, "/env/");
	var _list = fs.readdirSync(_folder);
	for(var _el in _list)
	{
		var _name = _list[_el].substring(0, _list[_el].length-3);
		var _e = require(path.join(_folder, _list[_el]));
		_res[_name] = _e;
	}
	return _res;
}

function Compiler()
{
	var _handler = this;
	this.TARGET = "standard";
	this.SPEC;
	this.EXPOSE = "";
	this.STD = "";
	this.GEN = "";
	this.PATH = "";
	if(CLI.stack[0]) this.PATH = path.dirname(CLI.stack[0]) + path.sep;
	
	this.ENV = ENV["std"];
	if(CLI.cli["--env"]) 
	{
		var _env = CLI.cli["--env"].argument;
		if(ENV[_env])
		{
			this.ENV = ENV[_env];
		}
		else 
		{
			console.log("[!] ENV: " + _env + " does not exist, please select one of [" + Object.keys(ENV).toString() + "]");
			process.exit(1);
		}
	}
	this.COMPILER = this.ENV.compiler;
	this.PRESET = "none";
	
	this.MAIN = fs.readFileSync(path.join(__dirname, "squel", this.ENV.main)).toString();
	
	this.IN = "";
	this.OUT = "";
	this.OPTION = "";
	
	this.DECL = "";
	
	this.FFI = [];
	
	this.INIT = "";
	
	this.REQUIRE = "";
	
	if(this.ENV.stdlib)
	{
		for(var _s in this.ENV.stdlib)
		{
			this.DECL += "var " + this.ENV.stdlib[_s] + ";";
			this.STD += this.ENV.stdlib[_s] +  " = require(\"" + this.ENV.stdlib[_s] + "\");";
		}
	}
	
	this.CODE = "";
	
	this.FOOTER = "";
	
	/*** METHODS ***/
	this.Parse = function(_code)
	{
		if(!CLI.cli["--no-check"]) LINT(_code, this.IN);
		_code = genRequire(_handler.PATH, COMPILER.STD) + genRequire(_handler.PATH, _code);
		
		COMPILER.REQUIRE = babel.transformSync(COMPILER.REQUIRE, visitor).code;
		COMPILER.REQUIRE = createFunction(COMPILER.REQUIRE);
		COMPILER.REQUIRE = createAnon(COMPILER.REQUIRE);
		
		_handler.CODE = babel.transformSync(_code, visitor).code;
		_handler.CODE = createFunction(_handler.CODE);
		_handler.CODE = createAnon(_handler.CODE);
		
		COMPILER.INIT += COMPILER.REQUIRE;
		
		function createFunction(_code)
		{	
			var _matchThis = new RegExp(/(| |{|,)__NJS_THIS([\.(";)]|$)/);
			var _return = ";return __NJS_Create_Undefined();}";
			var _returnThis = ";return __NJS_THIS;}";
			var _searchFN = new RegExp(/function (.[a-zA-Z0-9_\-]*) *\((.*)\)/);
			var _index = _code.search(_searchFN);
			while(_index > -1)
			{
				var _genFN = "__NJS_FN_" + RND();
				var _genVAR = "__NJS_VAR_" + RND();
				var _var = "";
				var _count = 0;
				var _start = -1;
				var _end = -1;
			
				let _match = _searchFN.exec(_code);

				_match[2] = _match[2].split(",");
				for(var i = 0; i < _match[2].length; i++)
				{
					if(_match[2][i].length > 0)
					{
						if(i != 0) _var += ",";
						_var += "__NJS_VAR " + _match[2][i];
					}
				}
				for(var i = _index; i < _code.length; i++)
				{
						if(_code[i] == "{")
						{
								if(_start == -1) _start = i;
								_count++;
						}
						else if(_code[i] == "}")
						{
							
							_end = i;
							_count--;
							if(_count == 0)
							{
								var _fn = _code.substring(_start, _end);
								var _fnThis = "{ var __NJS_THIS = __NJS_Create_Object();" + _code.substring(_start + 1, _end);

								if(_code.search(_matchThis) > -1) _fn = _fnThis;

								_handler.DECL += "var " + _match[1] +";";

								var _formated = "__NJS_DECL_FUNCTION<__NJS_VAR (" + _var + ")>* " + _genFN +" = new __NJS_DECL_FUNCTION<__NJS_VAR (" + _var + ")>([&](" + _var + ") -> __NJS_VAR" + _fn + _return + ");";
								_formated += _match[1] + "=__NJS_VAR(__NJS_FUNCTION, " + _genFN + ");";
								
								if(_match[1].indexOf("__MODULE") != 0)
								{
									var _genNew = "__NEW_" + _genFN;
									var _addNew = "__NJS_DECL_FUNCTION<__NJS_VAR (" + _var + ")>* " + _genNew +" = new __NJS_DECL_FUNCTION<__NJS_VAR (" + _var + ")>([&](" + _var + ") -> __NJS_VAR" + _fnThis + _returnThis + ");";
									_addNew += "var __NEW_" + _match[1] + "=__NJS_VAR(__NJS_FUNCTION, " + _genNew + ");";

									_formated += _addNew;
								}
								
								_code = [_code.slice(0, _index), _formated, _code.slice(_end + 1)].join('');
								break;
							}
						}
				}
				_index = _code.search(_searchFN);
			}
			return _code;
		}

		function createAnon(_code)
		{	
			var _matchThis = new RegExp(/(| |{|,)__NJS_THIS([\.(";)]|$)/);
			var _return = "return __NJS_Create_Undefined();}";
			var _searchAnonFN = new RegExp(/function *\(([a-zA-Z0-9_\-, ]*)\)/);
			var _index = _code.search(_searchAnonFN);
			while(_index > -1)
			{
				var _var = "";
				var _count = 0;
				var _start = -1;
				var _end = -1;
				var _genFN = "__NJS_FN_" + RND();
				var _genVAR = "__NJS_VAR_" + RND();
				
				var _match = _searchAnonFN.exec(_code);
				_match[1] = _match[1].split(",");
				for(var i = 0; i < _match[1].length; i++)
				{
					if(_match[1][i].length > 0)
					{
						if(i != 0) _var += ",";
						_var += "__NJS_VAR " + _match[1][i];
					}
				}
				for(var i = _index; i < _code.length; i++)
				{
						if(_code[i] == "{")
						{
								if(_start == -1) _start = i;
								_count++;
						}
						else if(_code[i] == "}")
						{
							_end = i;
							_count--;
							if(_count == 0)
							{
								
								var _fn = _code.substring(_start, _end);
								var _fnThis = "{ var __NJS_THIS = __NJS_Create_Object();" + _code.substring(_start + 1, _end);

								if(_code.search(_matchThis) > -1) _fn = _fnThis;
								
								var _formated = "__NJS_VAR(__NJS_FUNCTION, new function<__NJS_VAR (" + _var + ")> ([&](" + _var + ") -> __NJS_VAR" + _fn + os.EOL + _return + "));";
								_code = [_code.slice(0, _index), _formated, _code.slice(_end + 1)].join('');		
								break;
							}
						}
				}
				_index = _code.search(_searchAnonFN);
			}

			return _code;
		}

		_handler.MAIN = _handler.MAIN.replace("{CODE}", _handler.CODE);
		_handler.MAIN = _handler.MAIN.replace("{INIT}", _handler.INIT);
		_handler.MAIN = _handler.MAIN.replace("{DECL}", _handler.DECL);
		_handler.MAIN = _handler.MAIN.replace("{INCLUDE}", _handler.FFI.join(os.EOL));
	}
	  
	this.Prepare = function(_folder)
	{
		var _reg = 1000000;
		if(this.ENV.name == "arduino")
		{
			_reg = 1000;
			if(!this.TARGET)
			{
				this.TARGET = "nano"
			}
			if(this.TARGET.substring(0, 4) == "nano") _reg = 100;
		}
		var _src = fs.readFileSync(__dirname + "/src/njs.h").toString();
		_src = _src.replace(/{{REGISTER}}/g, _reg);
		fs.writeFileSync(path.join(_folder, "njs.h"), _src);
	};

	this.Out = function(_name)
	{
		if(os.platform() == "win32" && path.extname(_name) != ".exe") _handler.OUT = _name + ".exe";
		else _handler.OUT = _name;
		if(COMPILER.ENV.out && typeof COMPILER.ENV.out == "function")
		{
			_handler.OUT = COMPILER.ENV.out(_name);
		}
		return _handler.OUT;
	}

	this.CLI = function(compiler, out, _in, option)
	{
		if(this.ENV.cli)
		{
			return this.ENV.cli(compiler, this.preset, out, _in, option, this.TARGET, this.SPEC);
		}
		else return `${compiler} ${_in} ${option} -fpermissive -w -s  -o ${out}`;
	}
	  
	this.Compile = function(_folder, _file)
	{
		
		fs.writeFileSync(_file, _handler.MAIN);
		process.chdir(_folder);
		var _exec = _handler.CLI(_handler.COMPILER, _handler.OUT, _file, _handler.OPTION);
		execSync(_exec);
		
	}
	/*** END METHODS ***/
	
}

module.exports = new Compiler();