USE master;
GO

-- Drop database if exists
IF EXISTS(SELECT *
FROM sys.databases
WHERE name = 'IDEALDB')
BEGIN
    ALTER DATABASE IDEALDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE IDEALDB;
END
GO

-- Create new database
CREATE DATABASE IDEALDB;
GO

USE IDEALDB;
GO

-- Create archive schema
CREATE SCHEMA archive;
GO

-- First: Create tables with no foreign key dependencies
CREATE TABLE Sources
(
    SourceID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE ImageTypes
(
    TypeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE Roles
(
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE Categories
(
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE SubCategories
(
    SubCategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryID INT NOT NULL,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL,
    CONSTRAINT FK_SubCategories_Categories FOREIGN KEY (CategoryID)
        REFERENCES Categories(CategoryID)
);

CREATE TABLE Teams
(
    TeamID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE ConditionStatus
(
    ConditionStatusID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE WorkflowStages
(
    WorkflowStageID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE WsoUemStatus
(
    StatusID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

CREATE TABLE FormTypes
(
    FormTypeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255) NULL,
    RequiresReturn BIT NOT NULL,
    RequiresProjectInfo BIT NOT NULL,
    AllowsMultipleUnits BIT NOT NULL
);

CREATE TABLE CustodyActions
(
    CustodyActionID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255) NULL
);

-- Second: Create User tables
CREATE TABLE AppUsers
(
    AppUserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    RoleID INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    LastLoginAt DATETIME2 NULL,
    CONSTRAINT FK_AppUsers_Roles FOREIGN KEY (RoleID) 
        REFERENCES Roles(RoleID)
);

CREATE TABLE EndUsers
(
    EndUserID INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID NVARCHAR(50) UNIQUE,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE UserLinks
(
    AppUserID INT NOT NULL,
    EndUserID INT NOT NULL,
    PRIMARY KEY (AppUserID, EndUserID),
    CONSTRAINT FK_UserLinks_AppUsers FOREIGN KEY (AppUserID) 
        REFERENCES AppUsers(AppUserID),
    CONSTRAINT FK_UserLinks_EndUsers FOREIGN KEY (EndUserID) 
        REFERENCES EndUsers(EndUserID)
);

-- Third: Create Products table and related tables
CREATE TABLE Products
(
    ProductID INT IDENTITY(1,1) PRIMARY KEY,
    SKU NVARCHAR(255) NULL,
    Name NVARCHAR(255) NOT NULL,
    Manufacturer NVARCHAR(100) NOT NULL,
    ShortDescription NVARCHAR(255) NULL,
    LongDescription NVARCHAR(MAX) NULL,
    Specifications NVARCHAR(MAX) NULL,
    SourceID INT NOT NULL,
    IsMultipack BIT NOT NULL DEFAULT 0,
    BaseProductID INT NULL,
    UnitsPerPack INT NULL,
    ExternalSourceID NVARCHAR(255) NULL,
    LastSyncTimestamp DATETIME2 NULL,
    CategoryID INT NULL,
    SubCategoryID INT NULL,
    CONSTRAINT FK_Products_Sources FOREIGN KEY (SourceID) 
        REFERENCES Sources(SourceID),
    CONSTRAINT FK_Products_BaseProduct FOREIGN KEY (BaseProductID) 
        REFERENCES Products(ProductID),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryID)
        REFERENCES Categories(CategoryID),
    CONSTRAINT FK_Products_SubCategories FOREIGN KEY (SubCategoryID)
        REFERENCES SubCategories(SubCategoryID)
);

CREATE TABLE ProductImages
(
    ProductImageID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    ImageURL NVARCHAR(1000) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductID) 
        REFERENCES Products(ProductID)
);

-- Fourth: Create Items table
CREATE TABLE Items
(
    ItemID INT IDENTITY(1,1) PRIMARY KEY,
    ProductID INT NOT NULL,
    SerialNumber NVARCHAR(255) NULL,
    Barcode NVARCHAR(100) NULL,
    Quantity INT NULL,
    ConditionStatusID INT NOT NULL,
    WorkflowStageID INT NOT NULL,
    WsoUemDeviceId NVARCHAR(100) NULL,
    WsoUemStatusID INT NOT NULL DEFAULT 0,
    WsoUemLastSync DATETIME2 NULL,
    CurrentResponsibleEndUserID INT NULL,
    CurrentResponsibleTeamID INT NULL,
    LastModifiedByAppUserID INT NOT NULL,
    BaseUnitCount AS (Quantity) PERSISTED,
    CONSTRAINT FK_Items_Products FOREIGN KEY (ProductID) 
        REFERENCES Products(ProductID),
    CONSTRAINT FK_Items_ConditionStatus FOREIGN KEY (ConditionStatusID) 
        REFERENCES ConditionStatus(ConditionStatusID),
    CONSTRAINT FK_Items_WorkflowStages FOREIGN KEY (WorkflowStageID) 
        REFERENCES WorkflowStages(WorkflowStageID),
    CONSTRAINT FK_Items_WsoUemStatus FOREIGN KEY (WsoUemStatusID) 
        REFERENCES WsoUemStatus(StatusID),
    CONSTRAINT FK_Items_EndUsers FOREIGN KEY (CurrentResponsibleEndUserID) 
        REFERENCES EndUsers(EndUserID),
    CONSTRAINT FK_Items_Teams FOREIGN KEY (CurrentResponsibleTeamID) 
        REFERENCES Teams(TeamID),
    CONSTRAINT FK_Items_AppUsers FOREIGN KEY (LastModifiedByAppUserID) 
        REFERENCES AppUsers(AppUserID),
    CONSTRAINT CHK_QuantityXORSerial CHECK (
        (SerialNumber IS NULL AND Quantity IS NOT NULL) OR
        (SerialNumber IS NOT NULL AND Quantity IS NULL)
    )
);

-- Fifth: Create Forms table
CREATE TABLE Forms
(
    FormID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FormTypeID INT NOT NULL,
    ItemID INT NOT NULL,
    StatusID INT NOT NULL,
    CreatedTimestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    ProcessedTimestamp DATETIME2 NULL,
    CreatedByAppUserID INT NOT NULL,
    RecipientEndUserID INT NULL,
    CONSTRAINT FK_Forms_FormTypes FOREIGN KEY (FormTypeID) 
        REFERENCES FormTypes(FormTypeID),
    CONSTRAINT FK_Forms_Items FOREIGN KEY (ItemID) 
        REFERENCES Items(ItemID),
    CONSTRAINT FK_Forms_AppUsers FOREIGN KEY (CreatedByAppUserID) 
        REFERENCES AppUsers(AppUserID),
    CONSTRAINT FK_Forms_EndUsers FOREIGN KEY (RecipientEndUserID) 
        REFERENCES EndUsers(EndUserID)
);

-- Sixth: Create Notes table
CREATE TABLE Notes
(
    NoteID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    CreatedByAppUserID INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    Content NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_Notes_Items FOREIGN KEY (ItemID) 
        REFERENCES Items(ItemID),
    CONSTRAINT FK_Notes_AppUsers FOREIGN KEY (CreatedByAppUserID) 
        REFERENCES AppUsers(AppUserID)
);

-- Seventh: Create Custody tables
CREATE TABLE RecentCustodyLogs
(
    CustodyLogID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    CustodyActionID INT NOT NULL,
    FormID UNIQUEIDENTIFIER NULL,
    FromEndUserID INT NULL,
    ToEndUserID INT NULL,
    FromTeamID INT NULL,
    ToTeamID INT NULL,
    PerformedByAppUserID INT NOT NULL,
    ConditionStatusID INT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_RecentCustodyLogs_Items FOREIGN KEY (ItemID) 
        REFERENCES Items(ItemID),
    CONSTRAINT FK_RecentCustodyLogs_CustodyActions FOREIGN KEY (CustodyActionID) 
        REFERENCES CustodyActions(CustodyActionID),
    CONSTRAINT FK_RecentCustodyLogs_Forms FOREIGN KEY (FormID) 
        REFERENCES Forms(FormID),
    CONSTRAINT FK_RecentCustodyLogs_FromEndUser FOREIGN KEY (FromEndUserID) 
        REFERENCES EndUsers(EndUserID),
    CONSTRAINT FK_RecentCustodyLogs_ToEndUser FOREIGN KEY (ToEndUserID) 
        REFERENCES EndUsers(EndUserID),
    CONSTRAINT FK_RecentCustodyLogs_FromTeam FOREIGN KEY (FromTeamID) 
        REFERENCES Teams(TeamID),
    CONSTRAINT FK_RecentCustodyLogs_ToTeam FOREIGN KEY (ToTeamID) 
        REFERENCES Teams(TeamID),
    CONSTRAINT FK_RecentCustodyLogs_AppUsers FOREIGN KEY (PerformedByAppUserID) 
        REFERENCES AppUsers(AppUserID),
    CONSTRAINT FK_RecentCustodyLogs_ConditionStatus FOREIGN KEY (ConditionStatusID) 
        REFERENCES ConditionStatus(ConditionStatusID),
    CONSTRAINT CHK_RecentCustodyLogs_Date CHECK (Timestamp >= DATEADD(MONTH, -3, GETDATE()))
);

CREATE TABLE archive.CustodyLogs
(
    CustodyLogID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    CustodyActionID INT NOT NULL,
    FormID UNIQUEIDENTIFIER NULL,
    FromEndUserID INT NULL,
    ToEndUserID INT NULL,
    FromTeamID INT NULL,
    ToTeamID INT NULL,
    PerformedByAppUserID INT NOT NULL,
    ConditionStatusID INT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CustodyLogs_Items FOREIGN KEY (ItemID) 
        REFERENCES dbo.Items(ItemID),
    CONSTRAINT FK_CustodyLogs_CustodyActions FOREIGN KEY (CustodyActionID) 
        REFERENCES dbo.CustodyActions(CustodyActionID),
    CONSTRAINT FK_CustodyLogs_Forms FOREIGN KEY (FormID) 
        REFERENCES dbo.Forms(FormID),
    CONSTRAINT FK_CustodyLogs_FromEndUser FOREIGN KEY (FromEndUserID) 
        REFERENCES dbo.EndUsers(EndUserID),
    CONSTRAINT FK_CustodyLogs_ToEndUser FOREIGN KEY (ToEndUserID) 
        REFERENCES dbo.EndUsers(EndUserID),
    CONSTRAINT FK_CustodyLogs_FromTeam FOREIGN KEY (FromTeamID) 
        REFERENCES dbo.Teams(TeamID),
    CONSTRAINT FK_CustodyLogs_ToTeam FOREIGN KEY (ToTeamID) 
        REFERENCES dbo.Teams(TeamID),
    CONSTRAINT FK_CustodyLogs_AppUsers FOREIGN KEY (PerformedByAppUserID) 
        REFERENCES dbo.AppUsers(AppUserID),
    CONSTRAINT FK_CustodyLogs_ConditionStatus FOREIGN KEY (ConditionStatusID) 
        REFERENCES dbo.ConditionStatus(ConditionStatusID)
);

CREATE TABLE ItemImages
(
    ItemImageID INT IDENTITY(1,1) PRIMARY KEY,
    ItemID INT NOT NULL,
    CustodyLogID INT NOT NULL,
    ImageURL NVARCHAR(1000) NOT NULL,
    ImageTypeID INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedByAppUserID INT NOT NULL,
    CONSTRAINT FK_ItemImages_Items FOREIGN KEY (ItemID) 
        REFERENCES Items(ItemID),
    CONSTRAINT FK_ItemImages_ImageTypes FOREIGN KEY (ImageTypeID) 
        REFERENCES ImageTypes(TypeID),
    CONSTRAINT FK_ItemImages_AppUsers FOREIGN KEY (CreatedByAppUserID)
        REFERENCES AppUsers(AppUserID)
);
GO

-- Create unified view for custody logs
CREATE VIEW vw_CustodyLogs
AS
            SELECT *
        FROM dbo.RecentCustodyLogs
    UNION ALL
        SELECT *
        FROM archive.CustodyLogs;
GO

-- Create a view for inventory calculations
CREATE VIEW vw_ItemInventory
AS
    SELECT
        i.*,
        p.IsMultipack,
        p.UnitsPerPack,
        p.BaseProductID,
        CASE 
        WHEN p.IsMultipack = 1 THEN i.Quantity * p.UnitsPerPack
        ELSE i.Quantity 
    END AS TotalIndividualUnits
    FROM Items i
        JOIN Products p ON i.ProductID = p.ProductID;
GO

-- Finally: Create indexes
CREATE INDEX IX_Items_SerialNumber ON Items(SerialNumber) WHERE SerialNumber IS NOT NULL;
CREATE INDEX IX_Items_WsoUemDeviceId ON Items(WsoUemDeviceId) WHERE WsoUemDeviceId IS NOT NULL;
CREATE INDEX IX_Products_ExternalSourceID ON Products(ExternalSourceID) WHERE ExternalSourceID IS NOT NULL;
CREATE INDEX IX_RecentCustodyLogs_Timestamp ON RecentCustodyLogs(Timestamp);
CREATE INDEX IX_CustodyLogs_Timestamp ON archive.CustodyLogs(Timestamp);
CREATE INDEX IX_ItemImages_ItemID ON ItemImages(ItemID);
CREATE INDEX IX_ProductImages_ProductID ON ProductImages(ProductID);
CREATE INDEX IX_Items_BaseUnitCount ON Items(BaseUnitCount);
GO