-- Migration: Add rejection fields to transport_approvals and transport_fleet
-- Date: 2026-02-05

-- Add rejection fields to transport_approvals table
ALTER TABLE `transport_approvals` 
ADD COLUMN `is_rejected` BOOLEAN DEFAULT FALSE AFTER `is_approved`,
ADD COLUMN `rejection_reason` TEXT AFTER `is_rejected`;

-- Add rejection fields to transport_fleet table  
ALTER TABLE `transport_fleet` 
ADD COLUMN `is_rejected` BOOLEAN DEFAULT FALSE AFTER `barcode_fleet`,
ADD COLUMN `rejection_reason` VARCHAR(255) AFTER `is_rejected`;
