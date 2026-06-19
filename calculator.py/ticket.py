ticket= []
while True:
    print("--- Movie Ticket Booking System ---")
    print("1. book ticket")
    print("2. View booking")
    print("3. search booking")
    print("4. exit")
    choice = int(input("Enter your choice: "))
    if choice == 1:
        ticket.append(input("Enter your name: "))
        print("ticket booked successfully")
    elif choice == 2:
        for i in range(len(ticket)):
            print("booked tickets:", ticket[i],)
    elif choice == 3:    
        name = input("Enter name to search: ")
        if name in name:
            print(f"Name {name} is found.")
        else:
            print("name not found.")
    elif choice == 4:
        print("Thank you for using the system!")
        break
    else:
        print("Invalid choice. Please try again.")
    

