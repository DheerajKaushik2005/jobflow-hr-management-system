from sqlalchemy import Column, Integer, String
from database import Base


# =========================================================
# EMPLOYEE
# =========================================================

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)


# =========================================================
# DEPARTMENT
# =========================================================

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)


# =========================================================
# ATTENDANCE
# =========================================================

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employeeId = Column(Integer, nullable=False)
    employeeName = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)


# =========================================================
# LEAVE
# =========================================================

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employeeId = Column(Integer, nullable=False)
    leaveType = Column(String(100), nullable=False)
    fromDate = Column(String(50), nullable=False)
    toDate = Column(String(50), nullable=False)
    reason = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)


# =========================================================
# TASK
# =========================================================

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employeeId = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(String(500), nullable=False)
    dueDate = Column(String(50), nullable=False)
    priority = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)


# =========================================================
# ONBOARDING
# =========================================================

class Onboarding(Base):
    __tablename__ = "onboarding"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employeeId = Column(Integer, nullable=False)
    joiningDate = Column(String(50), nullable=False)
    onboardingStatus = Column(String(100), nullable=False)
    documentsStatus = Column(String(100), nullable=False)
    notes = Column(String(500), nullable=False)