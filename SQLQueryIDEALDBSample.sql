-- Ensure we're in the right database
USE IDEALDB;
GO

-- 1. Sources (no dependencies)
INSERT INTO Sources
    (Name, Description)
VALUES
    ('Dell Premier', 'Dell Premier API Integration'),
    ('Manual', 'Manually entered items'),
    ('WSO UEM', 'Workspace ONE UEM Integration');

-- 2. Roles (no dependencies)
INSERT INTO Roles
    (Name, Description)
VALUES
    ('System Admin', 'Full system access'),
    ('Asset Manager', 'Manages IT assets and inventory'),
    ('Desktop Support', 'Handles deployments and returns'),
    ('Helpdesk', 'Basic asset management tasks');

-- 3. Teams (no dependencies)
INSERT INTO Teams
    (Name, Description)
VALUES
    ('IT Asset Management', 'Central asset management team'),
    ('IT Desktop Support', 'Workstation support team'),
    ('IT Infrastructure', 'Network and server team'),
    ('IT Helpdesk', 'Tier 1 support team');

-- 4. ConditionStatus (no dependencies)
INSERT INTO ConditionStatus
    (Name, Description)
VALUES
    ('New', 'Factory sealed'),
    ('Like New', 'Opened but pristine'),
    ('Good', 'Normal wear'),
    ('Fair', 'Visible wear but functional'),
    ('Poor', 'Damaged but functional'),
    ('Broken', 'Non-functional');

-- 5. WorkflowStages (no dependencies)
INSERT INTO WorkflowStages
    (Name, Description)
VALUES
    ('On Order', 'Equipment ordered'),
    ('Receiving', 'Being processed'),
    ('In Stock', 'Available in inventory'),
    ('Staged', 'Ready for deployment'),
    ('Deployed', 'In active use'),
    ('Under Repair', 'Being serviced'),
    ('Retired', 'End of life');

-- 6. WsoUemStatus (no dependencies)
INSERT INTO WsoUemStatus
    (Name, Description)
VALUES
    ('Not Required', 'Device does not need UEM'),
    ('Enrolled', 'Device properly enrolled'),
    ('Pending', 'Awaiting enrollment'),
    ('Non-Compliant', 'Enrollment issue'),
    ('Retired', 'Removed from UEM');

-- 7. FormTypes (no dependencies)
INSERT INTO FormTypes
    (Name, Description, RequiresReturn, RequiresProjectInfo, AllowsMultipleUnits)
VALUES
    ('Equipment Assignment', 'Standard equipment checkout', 1, 0, 0),
    ('Bulk Supply', 'Multiple unit distribution', 0, 0, 1),
    ('Project Deployment', 'Project-based distribution', 1, 1, 1),
    ('Return', 'Equipment return form', 0, 0, 1);

-- 8. ImageTypes (no dependencies)
INSERT INTO dbo.ImageTypes
    (Name, Description)
VALUES
    ('Product', 'Catalog image'),
    ('Condition', 'Current condition'),
    ('Damage', 'Damage documentation'),
    ('Asset Tag', 'Asset tag photo'),
    ('Delivery', 'Delivery receipt');
GO

-- 9. CustodyActions (no dependencies)
INSERT INTO CustodyActions
    (Name, Description)
VALUES
    ('Initial Receipt', 'First receipt into inventory'),
    ('Assignment', 'Assigned to user'),
    ('Return', 'Returned to inventory'),
    ('Transfer', 'Transferred between users'),
    ('Repair Start', 'Sent for repair'),
    ('Repair Complete', 'Returned from repair'),
    ('Disposal', 'Marked for disposal');

-- Add after Sources but before Products
INSERT INTO Categories
    (Name, Description)
VALUES
    ('Laptops', 'Portable Computers'),
    ('Monitors', 'Displays and Screens'),
    ('Accessories', 'Computer Peripherals and Add-ons');

INSERT INTO SubCategories
    (CategoryID, Name, Description)
VALUES
    (1, 'Business Laptops', 'Enterprise Grade Laptops'),
    (1, 'Workstation Laptops', 'High Performance Mobile Workstations'),
    (2, 'Professional Monitors', 'Business Class Displays'),
    (3, 'Input Devices', 'Keyboards and Mice'),
    (3, 'Power Supplies', 'Power Adapters and Cables');

-- 10. AppUsers (depends on Roles)
INSERT INTO AppUsers
    (Username, Email, RoleID)
VALUES
    ('jsmith', 'john.smith@hospital.org', 1),
    ('mgarcia', 'maria.garcia@hospital.org', 2),
    ('tchen', 'tony.chen@hospital.org', 3),
    ('kpatel', 'kira.patel@hospital.org', 4);

-- 11. EndUsers (Equipment Recipients)
INSERT INTO EndUsers
    (EmployeeID, FirstName, LastName, Email)
VALUES
    ('E001', 'Robert', 'Wilson', 'robert.wilson@hospital.org'),
    ('E002', 'Sarah', 'Johnson', 'sarah.johnson@hospital.org'),
    ('E003', 'David', 'Lee', 'david.lee@hospital.org'),
    ('E004', 'Maria', 'Garcia', 'maria.garcia@hospital.org');

-- 12. UserLinks (depends on AppUsers and EndUsers)
INSERT INTO UserLinks
    (AppUserID, EndUserID)
VALUES
    (2, 4);
-- Maria Garcia is both Asset Manager and equipment recipient

-- 13. Products (depends on Sources)
INSERT INTO Products
    (SKU, Name, Manufacturer, ShortDescription, SourceID, CategoryID, SubCategoryID, IsMultipack, UnitsPerPack, ExternalSourceID)
VALUES
    -- Laptops
    ('210-BDKR', 'Dell Latitude 5420', 'Dell', '14" Business Laptop', 1, 1, 1, 0, NULL, 'latitude-5420'),
    ('210-AZCR', 'Dell Precision 5570', 'Dell', '15" Mobile Workstation', 1, 1, 2, 0, NULL, 'precision-5570'),
    -- Monitors
    ('210-BBMV', 'Dell P2422H', 'Dell', '24" Professional Monitor', 1, 2, 3, 0, NULL, 'p2422h'),
    -- Accessories
    ('570-ABGY', 'Dell Pro Wireless Keyboard and Mouse - KM5221W', 'Dell', 'Wireless Keyboard/Mouse Combo', 1, 3, 4, 0, NULL, 'km5221w'),
    -- Multipacks
    ('492-BBWF-5PK', 'Dell 65W USB-C Power Adapter (5-Pack)', 'Dell', '65W USB-C Power Adapter Bundle', 1, 3, 5, 1, 5, '492-bbwf-bulk'),
    ('570-ABGY-3PK', 'Dell Pro Wireless Keyboard and Mouse Combo (3-Pack)', 'Dell', 'Wireless Keyboard/Mouse Bundle', 1, 3, 4, 1, 3, 'km5221w-bulk');

-- 14. ProductImages (depends on Products)

INSERT INTO ProductImages
    (ProductID, ImageURL, IsPrimary)
VALUES
    -- Latitude 5420
    (1, 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/latitude-notebooks/14-5420/media-gallery/peripherals_laptop_latitude_5420_gallery_1.psd', 1),
    -- Precision 5570
    (2, 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/precision-mobile-workstations/15-5570/media-gallery/notebook-precision-15-5570-gallery-1.psd', 1),
    -- P2422H Monitor
    (3, 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/p-series/p2422h/media-gallery/monitor-p2422h-gallery-1.psd', 1),
    -- KM5221W Keyboard/Mouse
    (4, 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/peripherals/input-devices/dell/keyboards/km5221w/gallery/keyboard-mouse-km5221w-gallery-1.psd', 1);

-- 15. Sample Items
INSERT INTO Items
    (ProductID, SerialNumber, Quantity, ConditionStatusID, WorkflowStageID, WsoUemStatusID, CurrentResponsibleEndUserID, LastModifiedByAppUserID)
VALUES
    -- Serialized Items
    (1, '5420-XPS-001', NULL, 1, 5, 2, 1, 1),
    -- Deployed Latitude
    (1, '5420-XPS-002', NULL, 1, 3, 1, NULL, 1),
    -- In Stock Latitude
    (2, '5570-WKS-001', NULL, 1, 4, 1, NULL, 2),
    -- Staged Precision
    -- Bulk Items
    (5, NULL, 3, 1, 3, 1, NULL, 2),
    -- Power Adapters in stock
    (6, NULL, 2, 1, 3, 1, NULL, 2);
-- Keyboard/Mouse sets in stock