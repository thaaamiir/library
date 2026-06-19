print("choice 1 : add task")
print("choice 2 : view task")
print("choice 3 : delete task")
i=1
while True:
    ch=int(input("Enter your choice: "))
    if ch==1:
        task=input("enter your task :")
        print("task added successfully")
    if ch==2:
        print("your task is :",task)
    if ch==3:
        print("task deleted successfully")
        break
