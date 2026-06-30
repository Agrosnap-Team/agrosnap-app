##kwargs stander for keyword argument accept any number of named argument where not defined in the def signature

# def print_user_name(color , *args , **kwargs) :
#     print( kwargs)
#     print(type(kwargs))
#
#     print (f"{color} , {args} , {kwargs}")
# print_user_name("red", "green", "blue")

# user_info={ "username": "admin", "password": "123456" }
#
# def login(username, password):
#     user_info = {"username": "admin", "password": "123456"}
#
#     print(f"hi I am{username},{password}")
#
# login(**user_info)


# def formatte (**kwargs):
#
#     list = []
#     for column in kwargs.keys():
#         formatted = f"{column} = ? "
#         list.append(formatted)
#
# set_clause = ",".join(list)
#
#
# print(formatte(name='raad',email='radd@jlll'))



file = open ("example.txt" , "w")
file.write("Hello World")
file.close()