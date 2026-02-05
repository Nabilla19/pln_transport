-- Check if columns exist first, then add if not exists
-- Migration: Add rejection fields

-- For transport_approvals
ALTER TABLE `transport_approvals` 
ADD COLUMN IF NOT EXISTS `is_rejected` BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `rejection_reason` TEXT;

-- For transport_fleet
ALTER TABLE `transport_fleet` 
ADD COLUMN IF NOT EXISTS `is_rejected` BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS `rejection_reason` VARCHAR(255);
