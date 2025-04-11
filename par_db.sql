CREATE DATABASE par_db;
GO
 
USE par_db;
GO
 
CREATE TABLE UserRole (
	UserRoleID INT PRIMARY KEY NOT NULL,
    CreateUser BIT,
	EditUser BIT,
	CreateRule BIT,
	EditRule BIT,
	CreateNote BIT,
	Refresh BIT,
	ReadData BIT,
	SeeAlerts BIT,
	GenReports BIT,
    [Description] VARCHAR(255) NOT NULL
);
 
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(255) NOT NULL,
	LastName VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
	EmployeeID NVARCHAR(50) UNIQUE,
    IsActive BIT NOT NULL,
    UserRoleID INT NOT NULL,
    FOREIGN KEY (UserRoleID) REFERENCES UserRole(UserRoleID)
);
 
CREATE TABLE Category (
	CatID INT NOT NULL PRIMARY KEY,
	CatName VARCHAR(255),
	CatDesc VARCHAR(255)
	);
 
	CREATE TABLE SubCategory (
	SubCatID INT PRIMARY KEY,
	CatID INT NOT NULL,
	SubCatName VARCHAR(255),
	SubCatDesc VARCHAR(255),
	FOREIGN KEY (CatID) REFERENCES Category(CatID)
	);
 
CREATE TABLE Items (
    ParItemID INT PRIMARY KEY IDENTITY(1,1),
	ItemID INT NOT NULL,
    ProductID INT NOT NULL,
    SerialNumber VARCHAR(255) NULL,
    Barcode VARCHAR(255) NULL,
    TotalCount INT NULL CHECK (TotalCount >=0),
	CatID INT NOT NULL,
	SubCatID INT NULL,
	Source1Name VARCHAR(50) NULL,
	Source1Status VARCHAR(50) NULL,
	Source2Name VARCHAR(50) NULL,
	Source2Status VARCHAR(50) NULL,
	Serialized bit NULL,
    ConditionStatus VARCHAR(50) NOT NULL,
    WorkflowStage VARCHAR(50) NOT NULL,
    WorkspaceOneTrackingID INT NULL,
    CurrentResponsibleTeamID INT NULL,
    CurrentResponsibleUserID INT NULL,
	FOREIGN KEY (CatID) REFERENCES Category(CatID),
	FOREIGN KEY (SubCatID) REFERENCES SubCategory(SubCatID),
    FOREIGN KEY (CurrentResponsibleUserID) REFERENCES Users(UserID)
);
 
CREATE TABLE ParRules (
    RuleID INT PRIMARY KEY IDENTITY(1,1),
    ParItemID INT NOT NULL, 
    RuleName VARCHAR(255) NOT NULL UNIQUE,
    [Description] VARCHAR(255) NULL,
    ParValue INT NOT NULL, 
    OrderStatus BIT NOT NULL, 
	CreatedByUser INT NOT NULL,
    DateCreated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ParItemID) REFERENCES Items(ParItemID),
	FOREIGN KEY (CreatedByUser) REFERENCES Users(UserID)
);

CREATE TABLE ParNotes (
    NoteID INT PRIMARY KEY IDENTITY(1,1),
	ParItemID INT NOT NULL, 
	RuleID INT NULL,
    Note VARCHAR(255) NOT NULL,
    CreatedByUser INT NOT NULL,
    DateCreated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ParItemID) REFERENCES Items(ParItemID),
	FOREIGN KEY (RuleID) REFERENCES ParRules(RuleID),
    FOREIGN KEY (CreatedByUser) REFERENCES Users(UserID)
);