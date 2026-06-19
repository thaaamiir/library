num1=int(input("enter a number :"))
op=input("enter operator ( + , - , * , / )")
num2=int(input("enter a number :"))
if op=="+":
    print("sum =", num1 + num2 )
elif op=="-":
    print("diff =", num1 - num2 )
elif op=="*":
    print("product =", num1 * num2 )
elif op=="/":
    print("div =", num1 / num2 )
else:
    print("invalid operator")