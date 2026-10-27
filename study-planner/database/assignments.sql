-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS study_planner_db;

-- Select the database to use
USE study_planner_db;

-- Drop the table if it already exists (useful for development/testing)
DROP TABLE IF EXISTS assignments;

-- Create the assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    assignmentName VARCHAR(255) NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional: Insert some sample data for testing
-- INSERT INTO assignments (subject, assignmentName, deadline, status) VALUES
-- ('Mathematics', 'Solve Chapter 5 Problems', '2023-12-15', 'Pending'),
-- ('History', 'Research Paper Outline', '2023-12-10', 'In Progress'),
-- ('Computer Science', 'Implement Sorting Algorithm', '2023-12-20', 'Completed'),
-- ('Physics', 'Lab Report Analysis', '2023-12-18', 'Pending');

-- Add an index on deadline for faster sorting/filtering if needed
-- CREATE INDEX idx_deadline ON assignments(deadline);