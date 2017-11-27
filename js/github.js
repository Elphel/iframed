$(function(){
  console.log("init");
  init();
  
});

function init(){

  $("#content").css({
    padding: "20px"
  });
  
  $.ajax({
    url: "https://api.github.com/users/elphel",
    success: function(data){
        var template = `
<table>
<tr>
  <td><img width='100' src='`+data.avatar_url+`' /></td>
  <td>
    <div class='company-name'><a target='_blank' href='`+data.html_url+`'>`+data.name+`</a> on GitHub</div>
    <div class='company-bio'>`+data.bio+`</div>
  </td>
</tr>
</table>
<table>
<tr>
  <td><img width='50' src='https://github.com/fluidicon.png' /></td>
  <td><a target='_blank' href='`+data.html_url+`'>`+data.public_repos+` public repositories on GitHub</a>:</td>
</tr>
</table>
`;
        $("#head").html(template);
    }
  });

  $.ajax({
    url: "https://api.github.com/users/elphel/repos?per_page=60&sort=pushed",
    success: function(data){
       
      for(var i=0;i<data.length;i++){
        
        var d = new Date(data[i].pushed_at);
        
        var template = `
<hr/>
<div class='repo-wrapper'>
  <div class='repo-link'>
    <a target='_blank' href='`+data[i].html_url+`'>`+data[i].name+`</a>
  </div>
  <div class='repo-description'>`+data[i].description+`</div>
  <table>
  <tr>
    <td><div class='repo-updated'>Updated `+d.toLocaleDateString()+`</div></td>
  </tr>
  </table>
</div>
`;
        
        //var tmp_div = $("<div>").html(data[i].name);
        
        $("#content").append(template);
        
      }
    }
  });
  
}
