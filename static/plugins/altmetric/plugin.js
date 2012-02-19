var Plugin = function(){
  var self = this;

  this.init = function(){
    window.addEventListener("message", self.receiveMessage, false);
    self.app = window.parent.app;
  };

  this.receiveMessage = function(event){
    //if (event.origin !== "http://metatato.com") return false;

    var data = event.data;    
    var url = data[0].split("/");

    switch (url[0]){
      case "item":
        self.fetchMetrics(data[1], self.sendResponse);
      break;
    }
  };

  this.sendResponse = function(item, items){
    var data = ["item/" + item.id, items];
    window.parent.postMessage(data, "*"); // TODO: actual parent domain
  };
  
  this.altmetricURL = function(item){
    var url = "http://api.altmetric.com/v1/";

    if (item.doi) return url + "doi/" + item.doi;
    if (item.pmid) return url + "pmid/" + item.pmid;

    return false;
  };
  
  this.fetchMetrics = function(item, callback){
    var altmetric = self.altmetricURL(item);  
    if (!altmetric) return;

    $.getJSON(altmetric, { key: config.altmetric }, function showAltmetricData(data){
      var id = encodeURIComponent(data.altmetric_id);
      var items = [];
      
      if (data.cited_by_posts_count){
        items.push({
          url: "http://altmetric.com/details.php?citation_id=" + id,
          text: data.cited_by_posts_count + " posts",
        });
      }
      
      if (data.readers.mendeley){
        var mendeley_url;
        if (data.doi) mendeley_url = "http://www.mendeley.com/openURL?id=doi:" + encodeURIComponent(data.doi);
        else if (data.pmid) mendeley_url = "http://www.mendeley.com/openURL?id=pmid:" + encodeURIComponent(data.pmid);
        else mendeley_url = "http://altmetric.com/details.php?citation_id=" + id;
        
        items.push({
          url: mendeley_url,
          text: data.readers.mendeley + " readers",
          domain: "mendeley.com",
        });
      }
      
      if (data.cited_by_tweeters_count){
        items.push({
          url: "http://altmetric.com/details.php?citation_id=" + id,
          text: data.cited_by_tweeters_count + " tweets",
          domain: "twitter.com",
        });
      }
      
      if (typeof callback == "function") callback(item, items);
    });
  };
}

var plugin = new Plugin;
plugin.init();