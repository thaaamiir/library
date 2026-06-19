name = []
marks = []
while True:
    print("--- Student Management System ---")
    print("1. Add Student")
    print("2. View Students")
    print("3. search Student")
    print("4. exit")
    choice = int(input("Enter your choice: "))
    if choice == 1:
        name.append(input("Enter student name: "))
        marks.append(int(input("Enter student marks: ")))
    elif choice == 2:
        for i in range(len(name)):
            print("Name:", name[i], "Marks:", marks[i])
    elif choice == 3:    
        search_name = input("Enter student name to search: ")
        if search_name in name:
            print(f"Name {search_name} is found.")
        else:
            print("Student not found.")
    elif choice == 4:
        print("Exiting...")
        break
    else:
        print("Invalid choice. Please try again.")
    

