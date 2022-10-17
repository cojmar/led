<?php
session_start();
class router
{
    //==Routes

    function projects_list()
    {
        $out = $this->led_model->projects_list();
        json_output($out);
    }

    function save_project()
    {
        $validate = array("name");
        foreach ($validate as $field) if (empty($this->post_data[$field])) json_output(array("error" => "missing field $field"));

        $out = $this->led_model->add_edit_project($this->post_data);
        json_output($out);
    }

    function save_destination()
    {
        $validate = array("name", "project_id");
        foreach ($validate as $field) if (empty($this->post_data[$field])) json_output(array("error" => "missing field $field"));

        $out = $this->led_model->add_edit_destination($this->post_data);
        json_output($out);
    }

    //==Init
    private function init()
    {

        try {
            $this->post_data = json_decode(file_get_contents('php://input'), 1);
        } catch (\Throwable $th) {
            $this->post_data = array();
        }

        $this->db = new db_class();
        $this->led_model = new led_model();
        $this->db->connect("localhost", "root", "asdasd", "led_panel");
    }

    function __construct()
    {
        set_time_limit(0);
        $route = (!empty($_GET['route'])) ? $_GET['route'] : '';
        //==Run custom init
        if (method_exists($this, 'init')) $this->init();
        //==Run route
        if (method_exists($this, $route)) $this->$route();
    }
}
//==Autoload
spl_autoload_register(function ($class_name) {
    include  $class_name . '.php';
});
//==Run
ini_set('display_errors', 1);
error_reporting(E_ALL);
set_time_limit(0);
function json_output($data = false)
{
    $out = (is_array($data) || is_object($data)) ? json_encode($data) : json_encode(array($data));
    header('Content-Type: application/json');
    die($out);
}

$start_time = microtime(true);
ob_start();
new router();
$output = ob_get_contents();
$execution_time = microtime(true) - $start_time;
@ob_end_clean();
print "
		<style>
			body, html{
				margin:1px 3px;
				padding:0px;
			}
		</style>
		<div style='background-color:#5d5d5d;padding:5px;border:1px solid #5d5d5d;color:fff;font-size:14px;height:10px;line-height:10px;'>
			Execution time: {$execution_time} seconds
		</div>
	";
die($output);