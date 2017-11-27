/** 
 * @file elphel_messenger.js
 * @brief elphel cross-origin messenger
 * @copyright Copyright (C) 2017 Elphel Inc.
 * @author Oleg Dzhimiev <oleg@elphel.com>
 *
 * @licstart  The following is the entire license notice for the 
 * JavaScript code in this page.
 *
 *   The JavaScript code in this page is free software: you can
 *   redistribute it and/or modify it under the terms of the GNU
 *   General Public License (GNU GPL) as published by the Free Software
 *   Foundation, either version 3 of the License, or (at your option)
 *   any later version.  The code is distributed WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or FITNESS
 *   FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 *   As additional permission under GNU GPL version 3 section 7, you
 *   may distribute non-source (e.g., minimized or compacted) forms of
 *   that code without the copy of the GNU GPL normally required by
 *   section 4, provided you include this license notice and a URL
 *   through which recipients can access the Corresponding Source.
 *
 *  @licend  The above is the entire license notice
 *  for the JavaScript code in this page.
 */

var ElphelMessenger = {
  
  init: function(callback){
    
    if (window.self==window.top){
      //console.log("bingo! "+window.self.location.href);
      window.addEventListener("message",callback,false);
    }else{
      //console.log("not bingo! "+window.self.location.href);
      window.top.postMessage({href: window.self.location.href, name: window.self.name,mode:"init"},"*");
      
      alllinks = document.getElementsByTagName("a");
      
      console.log(window.self.name+" found links: "+alllinks.length);
      
      for(var i=0;i<alllinks.length;i++){
        alllinks[i].onclick = function(e){
          window.top.postMessage({href: this.href, host: this.host, target: window.self.location.host,name: window.self.name,mode:"click"},"*");
          //block event propagation
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
        };
      }
    }
    
  },
  
  receiveMessage: function(e){
    console.log(e.data.href);
  }
  
}
