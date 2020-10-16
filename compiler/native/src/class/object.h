#pragma once
#include "object_header.h"
#include <limits>

namespace NJS::Class
{
	// Constructors
	Object::Object() { }
	// Methods
	inline void Object::Delete() noexcept
	{
		if (--counter == 0)
		{
			delete this;
		}
	}
	inline void* Object::Copy() noexcept
	{
		counter++;
		return this;
	}
	// Native cast
	Object::operator bool() const noexcept { return true; }
	Object::operator double() const noexcept
	{
		return std::numeric_limits<double>::quiet_NaN();
	}
	Object::operator int() const noexcept
	{
		return std::numeric_limits<int>::quiet_NaN();
	}
	Object::operator long long() const noexcept
	{
		return std::numeric_limits<long long>::quiet_NaN();
	}
	Object::operator std::string() const noexcept
	{
		return "[object Object]";
	}
	// Main operators
	NJS::VAR const Object::operator[](NJS::VAR key) const
	{
		return undefined;
	}
	#ifdef __NJS__OBJECT_HASHMAP
	NJS::VAR &Object::operator[](NJS::VAR key)
	{
		NJS::VAR& _obj = object[(std::string)key];
		if(_obj)
		{
			if(!prototype)
			{
				return _obj;
			}
			else 
			{
				if((_obj).type == NJS::Enum::Type::Function)
				{
					((NJS::Class::Function*)_obj._ptr)->This.type = NJS::Enum::Type::Object;
					((NJS::Class::Function*)_obj._ptr)->This._ptr = this;
				}
				return _obj;
			}
		}

		if(((std::string)key).compare("toString") == 0  || ((std::string)key).compare("toLocaleString") == 0)
		{
			object[(std::string)key] = __NJS_Create_Var_Scoped_Anon( return __NJS_Object_Stringify(this););
		}
		else if(((std::string)key).compare("valueOf") == 0)
		{
			object[(std::string)key] = __NJS_Create_Var_Scoped_Anon( return this; );
		}

		return _obj;
	}
	#else
	NJS::VAR &Object::operator[](NJS::VAR key)
	{
		if (key.type == NJS::Enum::Type::Number)
		{
			auto i = (int)key;
			
			if (i < 0)
			{
				return undefined;
			}
			else 
			{
				if (i >= object.size())
				{
					object.reserve(i + 1);
					object.resize(i + 1);
				}
			}
			return object[i].second;
		}
		
		for (auto & search : object)
		{
			if (((std::string)key).compare(search.first) == 0)
			{
				if(!prototype)
				{
					return search.second;
				}
				else 
				{
					if(search.second.type == NJS::Enum::Type::Function)
					{
						((NJS::Class::Function*)search.second._ptr)->This.type = NJS::Enum::Type::Object;
						((NJS::Class::Function*)search.second._ptr)->This._ptr = this;				
					}
					
					return search.second;
				}
			}
		}

		if(((std::string)key).compare("toString") == 0  || ((std::string)key).compare("toLocaleString") == 0)
		{
			object.push_back(NJS::Type::pair_t((std::string)key, __NJS_Create_Var_Scoped_Anon( return __NJS_Object_Stringify(this);)));
		}
		else if(((std::string)key).compare("valueOf") == 0)
		{
			object.push_back(NJS::Type::pair_t((std::string)key, __NJS_Create_Var_Scoped_Anon( return this; )));
		}
		else 
		{
			object.push_back(NJS::Type::pair_t((std::string)key, undefined));
		}

		return object[object.size() - 1].second;
	}
	#endif
	template <class... Args>
	NJS::VAR Object::operator()(Args... args) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	// Comparation operators
	Object Object::operator!() const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	bool Object::operator==(const Object &_v1) const { return false; }
	// === emulated with __NJS_EQUAL_VALUE_AND_TYPE
	// !== emulated with __NJS_NOT_EQUAL_VALUE_AND_TYPE
	bool Object::operator!=(const Object &_v1) const { return true; }
	bool Object::operator<(const Object &_v1) const { return false; }
	bool Object::operator<=(const Object &_v1) const { return true; }
	bool Object::operator>(const Object &_v1) const { return false; }
	bool Object::operator>=(const Object &_v1) const { return true; }
	// Numeric operators
	Object Object::operator+() const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator-() const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator++(const int _v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator--(const int _v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator+(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator+=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator-(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator-=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator*(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator*=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	// TODO: "**" and "**=" operators
	Object Object::operator/(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator/=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator%(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator%=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator&(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator|(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator^(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator~() const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator>>(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator<<(const Object &_v1) const 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator&=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator|=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator^=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator>>=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	Object Object::operator<<=(const Object &_v1) 
	{
		#ifndef __NJS_ARDUINO 
		throw InvalidTypeException();
		#endif
	}
	// TODO: ">>>" and ">>>=" operators
} // namespace NJS::Class
