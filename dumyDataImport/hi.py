def main():
    numbers = set()         # Set to store unique numbers
    duplicates = []         # List to store duplicate numbers
    
    while True:
        user_input = input("Enter a number (or type 'stop' to end): ")
        
        if user_input.lower() == 'stop':
            break  # Exit the loop when user enters "stop"
        
        try:
            number = int(user_input)
        except ValueError:
            print("Invalid input. Please enter a valid number.")
            continue
        
        if number in numbers:
            print("Duplicate")
            if number not in duplicates:
                duplicates.append(number)
        else:
            numbers.add(number)
    
    print("Duplicate numbers entered:", duplicates)

# Run the program
main()
