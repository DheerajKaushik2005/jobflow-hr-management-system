from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI()


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PYDANTIC MODELS
# =========================================================

# ID is intentionally NOT included in POST data.
# MySQL will generate it automatically.

class Employee(BaseModel):
    name: str
    email: EmailStr
    department: str
    position: str


class Department(BaseModel):
    name: str
    description: str


class Attendance(BaseModel):
    employeeId: int
    employeeName: str
    date: str
    status: str


class Leave(BaseModel):
    employeeId: int
    leaveType: str
    fromDate: str
    toDate: str
    reason: str
    status: str


class Task(BaseModel):
    employeeId: int
    title: str
    description: str
    dueDate: str
    priority: str
    status: str


class Onboarding(BaseModel):
    employeeId: int
    joiningDate: str
    onboardingStatus: str
    documentsStatus: str
    notes: str


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "JobFlow API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================================================
# EMPLOYEE APIs - MYSQL
# =========================================================

@app.get("/employees")
def get_employees(
    db: Session = Depends(get_db)
):

    employees = db.query(models.Employee).all()

    return [
        {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "department": employee.department,
            "position": employee.position,
        }
        for employee in employees
    ]


@app.post("/employees")
def add_employee(
    employee: Employee,
    db: Session = Depends(get_db)
):

    db_employee = models.Employee(
        name=employee.name,
        email=str(employee.email),
        department=employee.department,
        position=employee.position,
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return {
        "message": "Employee added successfully",
        "employee": {
            "id": db_employee.id,
            "name": db_employee.name,
            "email": db_employee.email,
            "department": db_employee.department,
            "position": db_employee.position,
        }
    }


@app.put("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    employee: Employee,
    db: Session = Depends(get_db)
):

    db_employee = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id)
        .first()
    )

    if not db_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db_employee.name = employee.name
    db_employee.email = str(employee.email)
    db_employee.department = employee.department
    db_employee.position = employee.position

    db.commit()
    db.refresh(db_employee)

    return {
        "message": "Employee updated successfully",
        "employee": {
            "id": db_employee.id,
            "name": db_employee.name,
            "email": db_employee.email,
            "department": db_employee.department,
            "position": db_employee.position,
        }
    }


@app.delete("/employees/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):

    db_employee = (
        db.query(models.Employee)
        .filter(models.Employee.id == employee_id)
        .first()
    )

    if not db_employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db.delete(db_employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }


# =========================================================
# DEPARTMENT APIs - MYSQL
# =========================================================

@app.get("/departments")
def get_departments(
    db: Session = Depends(get_db)
):

    departments = db.query(models.Department).all()

    return [
        {
            "id": department.id,
            "name": department.name,
            "description": department.description,
        }
        for department in departments
    ]


@app.post("/departments")
def add_department(
    department: Department,
    db: Session = Depends(get_db)
):

    db_department = models.Department(
        name=department.name,
        description=department.description,
    )

    db.add(db_department)
    db.commit()
    db.refresh(db_department)

    return {
        "message": "Department added successfully",
        "department": {
            "id": db_department.id,
            "name": db_department.name,
            "description": db_department.description,
        }
    }


@app.put("/departments/{department_id}")
def update_department(
    department_id: int,
    department: Department,
    db: Session = Depends(get_db)
):

    db_department = (
        db.query(models.Department)
        .filter(models.Department.id == department_id)
        .first()
    )

    if not db_department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    db_department.name = department.name
    db_department.description = department.description

    db.commit()
    db.refresh(db_department)

    return {
        "message": "Department updated successfully",
        "department": {
            "id": db_department.id,
            "name": db_department.name,
            "description": db_department.description,
        }
    }


@app.delete("/departments/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db)
):

    db_department = (
        db.query(models.Department)
        .filter(models.Department.id == department_id)
        .first()
    )

    if not db_department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    db.delete(db_department)
    db.commit()

    return {
        "message": "Department deleted successfully"
    }


# =========================================================
# ATTENDANCE APIs - MYSQL
# =========================================================

@app.get("/attendance")
def get_attendance(
    db: Session = Depends(get_db)
):

    attendance_records = (
        db.query(models.Attendance).all()
    )

    return [
        {
            "id": record.id,
            "employeeId": record.employeeId,
            "employeeName": record.employeeName,
            "date": record.date,
            "status": record.status,
        }
        for record in attendance_records
    ]


@app.post("/attendance")
def add_attendance(
    record: Attendance,
    db: Session = Depends(get_db)
):

    db_record = models.Attendance(
        employeeId=record.employeeId,
        employeeName=record.employeeName,
        date=record.date,
        status=record.status,
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "message": "Attendance added successfully",
        "attendance": {
            "id": db_record.id,
            "employeeId": db_record.employeeId,
            "employeeName": db_record.employeeName,
            "date": db_record.date,
            "status": db_record.status,
        }
    }


@app.put("/attendance/{attendance_id}")
def update_attendance(
    attendance_id: int,
    record: Attendance,
    db: Session = Depends(get_db)
):

    db_record = (
        db.query(models.Attendance)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )

    if not db_record:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    db_record.employeeId = record.employeeId
    db_record.employeeName = record.employeeName
    db_record.date = record.date
    db_record.status = record.status

    db.commit()
    db.refresh(db_record)

    return {
        "message": "Attendance updated successfully",
        "attendance": {
            "id": db_record.id,
            "employeeId": db_record.employeeId,
            "employeeName": db_record.employeeName,
            "date": db_record.date,
            "status": db_record.status,
        }
    }


@app.delete("/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db)
):

    db_record = (
        db.query(models.Attendance)
        .filter(models.Attendance.id == attendance_id)
        .first()
    )

    if not db_record:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    db.delete(db_record)
    db.commit()

    return {
        "message": "Attendance deleted successfully"
    }


# =========================================================
# LEAVE APIs - MYSQL
# =========================================================

@app.get("/leaves")
def get_leaves(
    db: Session = Depends(get_db)
):

    leave_records = (
        db.query(models.Leave).all()
    )

    return [
        {
            "id": leave.id,
            "employeeId": leave.employeeId,
            "leaveType": leave.leaveType,
            "fromDate": leave.fromDate,
            "toDate": leave.toDate,
            "reason": leave.reason,
            "status": leave.status,
        }
        for leave in leave_records
    ]


@app.post("/leaves")
def add_leave(
    leave: Leave,
    db: Session = Depends(get_db)
):

    db_leave = models.Leave(
        employeeId=leave.employeeId,
        leaveType=leave.leaveType,
        fromDate=leave.fromDate,
        toDate=leave.toDate,
        reason=leave.reason,
        status=leave.status,
    )

    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)

    return {
        "message": "Leave added successfully",
        "leave": {
            "id": db_leave.id,
            "employeeId": db_leave.employeeId,
            "leaveType": db_leave.leaveType,
            "fromDate": db_leave.fromDate,
            "toDate": db_leave.toDate,
            "reason": db_leave.reason,
            "status": db_leave.status,
        }
    }


@app.put("/leaves/{leave_id}")
def update_leave(
    leave_id: int,
    leave: Leave,
    db: Session = Depends(get_db)
):

    db_leave = (
        db.query(models.Leave)
        .filter(models.Leave.id == leave_id)
        .first()
    )

    if not db_leave:
        raise HTTPException(
            status_code=404,
            detail="Leave record not found"
        )

    db_leave.employeeId = leave.employeeId
    db_leave.leaveType = leave.leaveType
    db_leave.fromDate = leave.fromDate
    db_leave.toDate = leave.toDate
    db_leave.reason = leave.reason
    db_leave.status = leave.status

    db.commit()
    db.refresh(db_leave)

    return {
        "message": "Leave updated successfully",
        "leave": {
            "id": db_leave.id,
            "employeeId": db_leave.employeeId,
            "leaveType": db_leave.leaveType,
            "fromDate": db_leave.fromDate,
            "toDate": db_leave.toDate,
            "reason": db_leave.reason,
            "status": db_leave.status,
        }
    }


@app.delete("/leaves/{leave_id}")
def delete_leave(
    leave_id: int,
    db: Session = Depends(get_db)
):

    db_leave = (
        db.query(models.Leave)
        .filter(models.Leave.id == leave_id)
        .first()
    )

    if not db_leave:
        raise HTTPException(
            status_code=404,
            detail="Leave record not found"
        )

    db.delete(db_leave)
    db.commit()

    return {
        "message": "Leave deleted successfully"
    }


# =========================================================
# TASK APIs - MYSQL
# =========================================================

@app.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db)
):

    task_records = (
        db.query(models.Task).all()
    )

    return [
        {
            "id": task.id,
            "employeeId": task.employeeId,
            "title": task.title,
            "description": task.description,
            "dueDate": task.dueDate,
            "priority": task.priority,
            "status": task.status,
        }
        for task in task_records
    ]


@app.post("/tasks")
def add_task(
    task: Task,
    db: Session = Depends(get_db)
):

    db_task = models.Task(
        employeeId=task.employeeId,
        title=task.title,
        description=task.description,
        dueDate=task.dueDate,
        priority=task.priority,
        status=task.status,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return {
        "message": "Task added successfully",
        "task": {
            "id": db_task.id,
            "employeeId": db_task.employeeId,
            "title": db_task.title,
            "description": db_task.description,
            "dueDate": db_task.dueDate,
            "priority": db_task.priority,
            "status": db_task.status,
        }
    }


@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task: Task,
    db: Session = Depends(get_db)
):

    db_task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not db_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db_task.employeeId = task.employeeId
    db_task.title = task.title
    db_task.description = task.description
    db_task.dueDate = task.dueDate
    db_task.priority = task.priority
    db_task.status = task.status

    db.commit()
    db.refresh(db_task)

    return {
        "message": "Task updated successfully",
        "task": {
            "id": db_task.id,
            "employeeId": db_task.employeeId,
            "title": db_task.title,
            "description": db_task.description,
            "dueDate": db_task.dueDate,
            "priority": db_task.priority,
            "status": db_task.status,
        }
    }


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    db_task = (
        db.query(models.Task)
        .filter(models.Task.id == task_id)
        .first()
    )

    if not db_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(db_task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }


# =========================================================
# ONBOARDING APIs - MYSQL
# =========================================================

@app.get("/onboarding")
def get_onboarding(
    db: Session = Depends(get_db)
):

    onboarding_records = (
        db.query(models.Onboarding).all()
    )

    return [
        {
            "id": record.id,
            "employeeId": record.employeeId,
            "joiningDate": record.joiningDate,
            "onboardingStatus": record.onboardingStatus,
            "documentsStatus": record.documentsStatus,
            "notes": record.notes,
        }
        for record in onboarding_records
    ]


@app.post("/onboarding")
def add_onboarding(
    record: Onboarding,
    db: Session = Depends(get_db)
):

    db_record = models.Onboarding(
        employeeId=record.employeeId,
        joiningDate=record.joiningDate,
        onboardingStatus=record.onboardingStatus,
        documentsStatus=record.documentsStatus,
        notes=record.notes,
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return {
        "message": "Onboarding record added successfully",
        "onboarding": {
            "id": db_record.id,
            "employeeId": db_record.employeeId,
            "joiningDate": db_record.joiningDate,
            "onboardingStatus": db_record.onboardingStatus,
            "documentsStatus": db_record.documentsStatus,
            "notes": db_record.notes,
        }
    }


@app.put("/onboarding/{onboarding_id}")
def update_onboarding(
    onboarding_id: int,
    record: Onboarding,
    db: Session = Depends(get_db)
):

    db_record = (
        db.query(models.Onboarding)
        .filter(models.Onboarding.id == onboarding_id)
        .first()
    )

    if not db_record:
        raise HTTPException(
            status_code=404,
            detail="Onboarding record not found"
        )

    db_record.employeeId = record.employeeId
    db_record.joiningDate = record.joiningDate
    db_record.onboardingStatus = record.onboardingStatus
    db_record.documentsStatus = record.documentsStatus
    db_record.notes = record.notes

    db.commit()
    db.refresh(db_record)

    return {
        "message": "Onboarding record updated successfully",
        "onboarding": {
            "id": db_record.id,
            "employeeId": db_record.employeeId,
            "joiningDate": db_record.joiningDate,
            "onboardingStatus": db_record.onboardingStatus,
            "documentsStatus": db_record.documentsStatus,
            "notes": db_record.notes,
        }
    }


@app.delete("/onboarding/{onboarding_id}")
def delete_onboarding(
    onboarding_id: int,
    db: Session = Depends(get_db)
):

    db_record = (
        db.query(models.Onboarding)
        .filter(models.Onboarding.id == onboarding_id)
        .first()
    )

    if not db_record:
        raise HTTPException(
            status_code=404,
            detail="Onboarding record not found"
        )

    db.delete(db_record)
    db.commit()

    return {
        "message": "Onboarding record deleted successfully"
    }