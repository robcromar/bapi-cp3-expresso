//employeeRouter by ROB Cromar
const express = require('express');
const employeeRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeeRouter.param('EmployeeId', (req, res, next, EmployeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $EmployeeId';
  const values = {$EmployeeId: EmployeeId};
  db.get(sql, values, (error, Employee) => {
    if (error) {
      next(error);
    } else if (Employee) {
      req.Employee = Employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeeRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err, Employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: Employees});
      }
    });
});

employeeRouter.get('/:EmployeeId', (req, res, next) => {
  res.status(200).json({employee: req.Employee});
});


employeeRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const dateOfBirth = req.body.employee.dateOfBirth;
  const biography = req.body.employee.biography;
  const isCurrentlyEmployed = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, date_of_birth, biography, is_current_employee)' +
      'VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: is_current_employee
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({employee: employee});
        });
    }
  });
});

employeeRouter.put('/:EmployeeId', (req, res, next) => {
  const name = req.body.employee.name,
        dateOfBirth = req.body.employee.dateOfBirth,
        biography = req.body.employee.biography,
        isCurrentlyEmployed = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, date_of_birth = $dateOfBirth, ' +
      'biography = $biography, is_current_employee = $isCurrentlyEmployed ' +
      'WHERE Employee.id = $EmployeeId';
  const values = {
    $name: name,
    $dateOfBirth: dateOfBirth,
    $biography: biography,
    $isCurrentlyEmployed: isCurrentlyEmployed,
    $EmployeeId: req.params.EmployeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.EmployeeId}`,
        (error, Employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeeRouter.delete('/:EmployeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $EmployeeId';
  const values = {$EmployeeId: req.params.EmployeeId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.EmployeeId}`,
        (error, Employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

module.exports = employeeRouter;
