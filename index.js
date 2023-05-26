const inquirer = require('inquirer');
const mysql = require('mysql2');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'employee_db',
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');
  startApp();
});

// Function to start the application
function startApp() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'menuChoice',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.menuChoice) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          console.log('Disconnected from MySQL server');
          break;
      }
    });
}

// Function to view all departments
function viewDepartments() {
  connection.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// Function to view all roles
function viewRoles() {
  const query =
    'SELECT role.id, role.title, role.salary, department.name AS department FROM role ' +
    'INNER JOIN department ON role.department_id = department.id';

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// Function to view all employees
function viewEmployees() {
  const query =
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, ' +
    'role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager ' +
    'FROM employee ' +
    'INNER JOIN role ON employee.role_id = role.id ' +
    'INNER JOIN department ON role.department_id = department.id ' +
    'LEFT JOIN employee AS manager ON employee.manager_id = manager.id';

  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startApp();
  });
}

// Function to add a department
function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
      },
    ])
    .then((answers) => {
      connection.query(
        'INSERT INTO department (name) VALUES (?)',
        [answers.departmentName],
        (err) => {
          if (err) throw err;
          console.log('Department added successfully!');
          startApp();
        }
      );
    });
}

// Function to add a role
function addRole() {
  connection.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'input',
          name: 'roleTitle',
          message: 'Enter the title of the role:',
        },
        {
          type: 'input',
          name: 'roleSalary',
          message: 'Enter the salary for the role:',
        },
        {
          type: 'list',
          name: 'roleDepartment',
          message: 'Select the department for the role:',
          choices: departments.map((department) => department.name),
        },
      ])
      .then((answers) => {
        const departmentId = departments.find(
          (department) => department.name === answers.roleDepartment
        ).id;

        connection.query(
          'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
          [answers.roleTitle, answers.roleSalary, departmentId],
          (err) => {
            if (err) throw err;
            console.log('Role added successfully!');
            startApp();
          }
        );
      });
  });
}

// Function to add an employee
function addEmployee() {
  connection.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;

    connection.query('SELECT * FROM employee', (err, employees) => {
      if (err) throw err;

      const employeeChoices = employees.map(
        (employee) =>
          `${employee.first_name} ${employee.last_name} (ID: ${employee.id})`
      );

      inquirer
        .prompt([
          {
            type: 'input',
            name: 'firstName',
            message: "Enter the employee's first name:",
          },
          {
            type: 'input',
            name: 'lastName',
            message: "Enter the employee's last name:",
          },
          {
            type: 'list',
            name: 'role',
            message: "Select the employee's role:",
            choices: roles.map((role) => role.title),
          },
          {
            type: 'list',
            name: 'manager',
            message: "Select the employee's manager:",
            choices: ['None'].concat(employeeChoices),
          },
        ])
        .then((answers) => {
          const roleId = roles.find((role) => role.title === answers.role).id;

          let managerId = null;
          const selectedManager = answers.manager;
          if (selectedManager !== 'None') {
            managerId = employees.find((employee) => {
              const fullName = `${employee.first_name} ${employee.last_name}`;
              return fullName === selectedManager.split(' (ID: ')[0];
            }).id;
          }

          connection.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
            [answers.firstName, answers.lastName, roleId, managerId],
            (err) => {
              if (err) throw err;
              console.log('Employee added successfully!');
              startApp();
            }
          );
        });
    });
  });
}

// Function to update an employee role
function updateEmployeeRole() {
  connection.query('SELECT * FROM employee', (err, employees) => {
    if (err) throw err;

    connection.query('SELECT * FROM role', (err, roles) => {
      if (err) throw err;

      const employeeChoices = employees.map(
        (employee) =>
          `${employee.first_name} ${employee.last_name} (ID: ${employee.id})`
      );

      inquirer
        .prompt([
          {
            type: 'list',
            name: 'employee',
            message: 'Select the employee to update:',
            choices: employeeChoices,
          },
          {
            type: 'list',
            name: 'role',
            message: 'Select the new role for the employee:',
            choices: roles.map((role) => role.title),
          },
        ])
        .then((answers) => {
          const employeeId = parseInt(
            answers.employee.match(/ID: (\d+)/)[1]
          );
          const roleId = roles.find((role) => role.title === answers.role).id;

          connection.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [roleId, employeeId],
            (err) => {
              if (err) throw err;
              console.log('Employee role updated successfully!');
              startApp();
            }
          );
        });
    });
  });
}
