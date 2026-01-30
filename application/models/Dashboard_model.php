<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Dashboard_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Get total transport requests
     */
    public function get_total_requests($status = null)
    {
        if ($status) {
            $this->db->where('status', $status);
        }
        return $this->db->count_all_results('transport_requests');
    }

    /**
     * Get total vehicles
     */
    public function get_total_vehicles($status = null)
    {
        if ($status) {
            $this->db->where('status', $status);
        }
        return $this->db->count_all_results('transport_vehicles');
    }

    /**
     * Get requests created today
     */
    public function get_requests_today()
    {
        $this->db->where('DATE(created_at)', date('Y-m-d'));
        return $this->db->count_all_results('transport_requests');
    }

    /**
     * Get monthly request counts for the current year
     */
    public function get_monthly_requests()
    {
        $year = date('Y');
        $sql = "
            SELECT 
                MONTH(created_at) as month, 
                COUNT(*) as total 
            FROM transport_requests 
            WHERE YEAR(created_at) = ? 
            GROUP BY MONTH(created_at)
            ORDER BY month ASC
        ";
        $result = $this->db->query($sql, array($year))->result_array();
        
        $data = array_fill(0, 12, 0);
        foreach ($result as $row) {
            $data[$row['month'] - 1] = (int)$row['total'];
        }
        return $data;
    }

    /**
     * Get latest transport requests for the dashboard table
     */
    public function get_latest_requests($limit = 5)
    {
        $this->db->select('tr.*, u.name as user_name');
        $this->db->from('transport_requests tr');
        $this->db->join('users u', 'u.id = tr.user_id', 'left');
        $this->db->order_by('tr.created_at', 'DESC');
        $this->db->limit($limit);
        return $this->db->get()->result_array();
    }
}
