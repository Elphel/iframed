<?php
  // subbed with window.location.href=window.location.href?iframe=true in frames.js
  /*
  if (preg_match("/www\.elphel\.com/",$_SERVER['HTTP_REFERER'])){
    header("X-Frame-Options: DENY");
  }
  */

  $TITLE = "Elphel: Free Software &amp; Open Hardware Imaging";
  $HELP = file_get_contents("help.html");

  $TARGET_LIST = Array(
    Array(
      "id"     => "www3",
      "name"   => "Main",
      "href"   => "https://www3.elphel.com",
      "search" => "https://www3.elphel.com/search/node/",
      "search_index" => "0",
      "color"  => "rgba(51,102,153,1)"
    ),
    Array(
      "id"     => "blog",
      "name"   => "Blog",
      "href"   => "https://blog.elphel.com",
      "search" => "https://blog.elphel.com?s=",
      "search_index" => "1",
      "color"  => "rgba(102,159,65,1)"
    ),
    Array(
      "id"     => "wiki",
      "name"   => "Wiki/Docs",
      "href"   => "https://wiki.elphel.com/wiki",
      "search" => "https://wiki.elphel.com/index.php?title=Special%3ASearch&fulltext=Search&limit=500&search=",
      "search_index" => "2",
      "color"  => "rgba(27,63,137,1)"
    ),
    Array(
      "id"     => "support",
      "name"   => "Support",
      "href"   => "https://www.mail-archive.com/support-list@support.elphel.com",
      "search" => "https://www.mail-archive.com/search?l=support-list%40support.elphel.com&a=1&notwords=blog%3A&haswords=",
      "search_index" => "3",
      "color"  => "rgba(182,47,7,1)"
    ),
    Array(
      "id"     => "code",
      "name"   => "Code",
      "href"   => "https://git.elphel.com",
      "search" => "https://git.elphel.com/search?utf8=✓&group_id=&project_id=&repository_ref=&search=",
      "search_index" => "4",
      "color"  => "rgba(0,0,0,0.7)"
    )
  );

  // used to decode the major URI request to sub website address
  $LIST_IDs = Array();
  $LIST_HREFs = Array();

  foreach($TARGET_LIST as $v){
    array_push($LIST_IDs, $v["id"]);
    array_push($LIST_HREFs, $v["href"]);
  }

  // decode http://{this_iframed_site}/{id}/uri string into
  // {href}/uri
  $request_uri = $_SERVER['REQUEST_URI'];
  $websites = explode("/",$request_uri);

  // $tmp_str is the decoded {href}/uri
  $tmp_str = "";

  if(isset($websites[1])){
    $website = $websites[1];
    $uri = implode("/",array_slice($websites,2));

    foreach($LIST_IDs as $key=>$id){
      if ($id==$website){
        $tmp_str = $LIST_HREFs[$key]."/".$uri;
        break;
      }
    }
  }

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title><?php echo $TITLE;?></title>

  <script src="js/jquery-3.1.1.js"></script>
  <script src="js/jquery-ui.js"></script>
  <script src="js/elphel_messenger.js"></script>
  <script src="js/frames.js"></script>

  <link rel="stylesheet" href="js/frames.css">
</head>
<body onresize="resize()">

<div id="panel"></div>
<div id="content"></div>

<?php echo $HELP;?>

<?php

echo "<script>\n";

$targets = Array();
foreach($TARGET_LIST as $target){
  $str  = "  {\n";
  $str .= "    name: \"".$target['name']."\",\n";
  $str .= "    color: \"".$target['color']."\",\n";
  $str .= "    search: \"".$target['search']."\",\n";
  $str .= "    search_index: ".$target['search_index'].",\n";
  $str .= "    href: \"".$target['href']."\"\n";
  $str .= "  }";
  array_push($targets,$str);
}
$str = implode(",\n",$targets);

echo "  var targets = [\n$str];";

echo "  var custom_url=\"$tmp_str\";\n";

echo "</script>\n";

?>
<script>

  //defaults
  var cols = 5;
  var order = [0,1,2,3,4];
  var rows = Math.ceil(targets.length/cols);

  // constants
  var width_base = 1055;
  var min_col_width = 100;
  var base_vstep = 150;

  var iframe_adjustment_base_value = 5;
  var iframe_adjustment_selected_value = 3;

</script>

</body>
</html>
