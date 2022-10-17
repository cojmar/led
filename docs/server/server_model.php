<?php
class server_model
{
    function __construct()
    {
        $this->db = new db_class();
    }

    function array_to_insert_update_sql($data, $table)
    {
        $sql = '';
        foreach ($data as $k => $v) {
            $sql .= ($sql == '') ? "`$k`=" . $this->db->escape($v) : ",`$k`=" . $this->db->escape($v);
        }
        $sql = "insert into `$table` set $sql on duplicate key update $sql";
        return $sql;
    }

    // projects
    function projects_list()
    {
        $sql = "SELECT * from led_projects";
        $projects = $this->db->query($sql)->fetchAll();

        $sql = "SELECT * from led_panels";
        $panels = $this->db->query($sql)->fetchAll();

        $sql = "SELECT * from led_destinations";
        $destinations = $this->db->query($sql)->fetchAll();

        $ret = array();
        foreach ($projects as $item) {
            $ret[$item['id']] = $item;
            $ret[$item['id']]['panels'] = array();
            $ret[$item['id']]['destinations'] = array();
        }

        foreach ($panels as $item)
            if (!empty($item['project_id'])) $ret[$item['project_id']]['panels'][] = $item;

        foreach ($destinations as $item)
            if (!empty($item['project_id'])) $ret[$item['project_id']]['destinations'][] = $item;

        return array_values($ret);
    }

    function add_edit_project($data)
    {
        if (empty($data)) return false;
        $sql = $this->array_to_insert_update_sql($data, 'led_projects');
        $this->db->query($sql);
    }

    function delete_project($project_id)
    {
        if (empty($project_id)) return false;
        $sqls = array();
        $sqls[] = "delete from led_panels_data where destination_id in (select * from led_destinations where project_id=$project_id)";
        $sqls[] = "delete from led_destinations where project_id=$project_id";
        $sqls[] = "delete from led_panels where project_id=$project_id";
        $sqls[] = "delete from led_projects where id=$project_id";

        foreach ($sqls as $sql)
            $this->db->query($sql);
    }

    // destinations
    function add_edit_destination($data)
    {
        if (empty($data)) return false;
        $sql = $this->array_to_insert_update_sql($data, 'led_destinations');
        $this->db->query($sql);
    }

    function delete_destination($destination_id)
    {
        if (empty($destination_id)) return false;
        $sqls = array();
        $sqls[] = "delete from led_panels_data where destination_id = $destination_id";
        $sqls[] = "delete from led_destinations where destination_id=$destination_id";

        foreach ($sqls as $sql)
            $this->db->query($sql);
    }

    // panels
    function add_edit_panel($data)
    {
        if (empty($data)) return false;
        $sql = $this->array_to_insert_update_sql($data, 'led_panels');
        $this->db->query($sql);
    }

    function delete_panel($panel_id)
    {
        if (empty($panel_id)) return false;
        $sqls = array();
        $sqls[] = "delete from led_panels_data where panel_id = $panel_id";
        $sqls[] = "delete from led_panels where panel_id = $panel_id";

        foreach ($sqls as $sql)
            $this->db->query($sql);
    }

    function add_edit_panel_data($data)
    {
        if (empty($data)) return false;
        $sql = $this->array_to_insert_update_sql($data, 'led_panels_data');
        $this->db->query($sql);
    }

    function delete_panel_data($destination_id)
    {
        if (empty($destination_id)) return false;
        $sqls = array();
        $sqls[] = "delete from led_panels_data where destination_id = $destination_id";

        foreach ($sqls as $sql)
            $this->db->query($sql);
    }
}