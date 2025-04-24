USE par_db;
GO

INSERT INTO UserRole (UserRoleID, CreateUser, EditUser, CreateRule, EditRule, CreateNote, Refresh, ReadData, SeeAlerts, GenReports, [Description])
VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 'Admin role with full access'),
(2, 1, 0, 1, 0, 1, 1, 1, 0, 0, 'Manager role with limited access'),
(3, 0, 0, 0, 0, 1, 0, 1, 0, 0, 'Employee role with read-only access');
GO

INSERT INTO Users (Username, FirstName, LastName, Email, EmployeeID, IsActive, UserRoleID)
VALUES
('dorian1', 'Dorian', 'Gray', 'dorian.gray@health.southalabama.edu', 'J101', 1, 1),
('elizabeth1', 'Elizabeth', 'Bennet', 'elizabeth.bennet@health.southalabama.edu', 'J102', 1, 2),
('jane1', 'Jane', 'Eyre', 'jane.eyre@health.southalabama.edu', 'J103', 1, 3),
('sherlock1', 'Sherlock', 'Holmes', 'sherlock.holmes@health.southalabama.edu', 'J104', 1, 1),
('winston1', 'Winston', 'Smith', 'winston.smith@health.southalabama.edu', 'J105', 1, 2);
GO

INSERT INTO Category (CatID, CatName, CatDesc)
VALUES
(1, 'Laptops', 'Portable Computers'),
(2, 'Monitors', 'Displays and Screens'),
(3, 'Networking', 'Networking Equipment'),
(4, 'Accessories', 'Computer Peripherals');
GO

INSERT INTO SubCategory (SubCatID, CatID, SubCatName, SubCatDesc)
VALUES
(1, 1, 'Business Laptops', 'Enterprise Grade Laptops'),
(2, 1, 'Workstation Laptops', 'High Performance Mobile Workstations'),
(3, 2, 'Professional Monitors', 'Business Class Displays'),
(4, 3, 'Routers', 'Wi-Fi and Networking Routers'),
(5, 4, 'Keyboards', 'Wired and Wireless Keyboards');
GO

  --I literally cannot figure out why this wont disaply like this
INSERT INTO Items (ItemID, ProductID, SerialNumber, Barcode, TotalCount, CatID, SubCatID, ConditionStatus, WorkflowStage, CurrentResponsibleUserID)
VALUES
(1, 1, 'SN1001', 'BC1001', 5, 1, 1, 'New', 'In Stock', 1),
(2, 2, 'SN1002', 'BC1002', 7, 1, 2, 'Used', 'In Stock', 2),
(3, 3, 'SN2001', 'BC2001', 12, 2, 3, 'New', 'In Stock', 3),
(4, 4, 'SN3001', 'BC3001', 5, 3, 4, 'New', 'In Stock', 1),
(5, 5, 'SN4001', 'BC4001', 8, 3, 5, 'Used', 'In Stock', 2);
GO

INSERT INTO ParRules (ParItemID, RuleName, [Description], ParValue, IsActive, CreatedByUser, OrderStatus)
VALUES
(1, 'Critical Low Stock - Laptops', 'Trigger when stock of laptops falls below 3 units.', 3, 1, 1, 1),
(2, 'Critical Low Stock - Monitors', 'Trigger when stock of monitors falls below 2 units.', 2, 1, 2, 1),
(3, 'Stock Below Threshold - Routers', 'Trigger when stock of routers falls below 5 units.', 5, 1, 3, 1),
(4, 'Stock Below Threshold - Workstations', 'Trigger when stock of workstations falls below 5 units.', 5, 1, 4, 1),
(5, 'Critical Low Stock - Network Cables', 'Trigger when stock of network cables falls below 10 units.', 10, 1, 5, 1);
GO

INSERT INTO ParNotes (ParItemID, RuleID, Note, CreatedByUser)
VALUES
(1, 1, 'Laptop stock has less than 3 units available.', 1),
(2, 2, 'Monitor stock is below 2 units.', 2),
(3, 3, 'Router stock is below 5 units.', 3),
(4, 4, 'Workstation stock is below 5 units.', 4),
(5, 5, 'Network cable stock has fallen below 10 units.', 5);
GO
