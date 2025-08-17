import java.util.Scanner; // Import the Scanner class
import java.util.InputMismatchException; // For better error handling if input isn't a number

public class Main { // Or whatever class name matches your file name
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in); // Create a Scanner object to read input

        System.out.println("Enter two numbers separated by a space (e.g., 2 11):");
        String inputLine = scanner.nextLine(); // Reads the entire line as a single string

        // Split the string by one or more spaces
        String[] numbersAsStrings = inputLine.trim().split("\\s+"); // .trim() handles leading/trailing spaces, \\s+ handles multiple spaces

        int num1 = 0;
        int num2 = 0;
        boolean validInput = true;

        if (numbersAsStrings.length >= 2) {
            try {
                num1 = Integer.parseInt(numbersAsStrings[0]); // Convert the first part to an integer
                num2 = Integer.parseInt(numbersAsStrings[1]); // Convert the second part to an integer
            } catch (NumberFormatException e) {
                System.out.println("Error: Invalid number format. Please enter valid integers.");
                validInput = false;
            }
        } else {
            System.out.println("Error: Please provide at least two numbers separated by a space.");
            validInput = false;
        }

        if (validInput) {
            int sumOfNumbers = num1 + num2;
            System.out.println("The sum of the two numbers is: " + sumOfNumbers);
        }

        scanner.close(); // Close the scanner to release system resources
    }
}
