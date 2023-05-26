-- Inserting sample departments
INSERT INTO department (id, name)
VALUES
  (1, 'Sales'),
  (2, 'Marketing'),
  (3, 'Finance');

-- Inserting sample roles
INSERT INTO role (id, title, salary, department_id)
VALUES
  (1, 'Manager', 10000.00, 1),
  (2, 'Salesperson', 5000.00, 1),
  (3, 'Marketing Specialist', 7000.00, 2),
  (4, 'Accountant', 8000.00, 3);

-- Inserting sample employees
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
  (1, 'John', 'Doe', 1, NULL),
  (2, 'Jane', 'Smith', 2, 1),
  (3, 'Mike', 'Johnson', 2, 1),
  (4, 'Emily', 'Brown', 3, 2),
  (5, 'David', 'Davis', 4, NULL);
