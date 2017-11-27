<?php

//need an array

$dict = Array(
  "https://www3.elphel.com/search/node/",
  "https://blog.elphel.com?s=",
  "https://wiki.elphel.com/index.php?title=Special%3ASearch&fulltext=Search&limit=500&search=",
  "https://www.mail-archive.com/search?l=support-list%40support.elphel.com&a=1&notwords=blog%3A&haswords=",
  "https://git.elphel.com/search?utf8=✓&group_id=&project_id=&repository_ref=&search="
);

$i = $_GET['i'];
$q = $_GET['q'];

$content = file_get_contents("{$dict[$i]}{$q}");

//echo "Opening: {$dict[$i]}{$q}\n";

//echo $content;

switch($i){
  case (0):
    preg_match_all('/<li class="search-result">/',$content,$matches);
    $result = count($matches[0]);
    if (intval($result)==10) $result .= "+";
    break;
  case (1):
    preg_match_all('/<div class="post" id=/',$content,$matches);
    $result = count($matches[0]);
    if (intval($result)==10) $result .= "+";
    break;
  case (2):
    preg_match_all('/<div class=\'searchresult\'>/',$content,$matches);
    $result = count($matches[0]);
    break;
  case (3):
    preg_match_all('/[0-9]* matches<\/h2>/',$content,$matches);
    preg_match_all('/[0-9]* /',$matches[0][0],$numbers);
    $result = $numbers[0][0];
//     "searchpg->h3 or look for <h2> containing X matches"
    break;
  case (4):
      
    preg_match_all('/<span class=\"badge\">\n([0-9]*)\n<\/span>/',$content,$matches); 
    
    $result = 0;
    foreach($matches[1] as $val){
      $result += intval($val);
    }
    break;
  default:
//     report n/a
  break;
}

echo $result;

?>
