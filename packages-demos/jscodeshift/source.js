'use strict';

module.exports = {
  load () {
    (function cocos(){
        try {
          const { join, resolve } = require('path');
          const { app } = require('electron');
          const builderPath = resolve(join(app.getPath('appData'), 'CocosCreator/builder-wasm'));
          //todo:使用 wasm 提升构建的速度
          const builder = require(builderPath);
          builder.init(this);
        } catch (e) {}
      })();
  },

  unload () {
  },

  messages: {
    open () {
      Editor.Panel.open('asset-db-debugger');
    },

    'query-info' ( event ) {
      var results = [];
      for ( var p in Editor.assetdb._path2uuid ) {
        var url = Editor.assetdb._url(p);
        results.push({ url: url, uuid: Editor.assetdb._path2uuid[p] });
      }
      results.sort( function ( a, b ) {
        return a.url.localeCompare(b.url);
      });
      event.reply(null, results);
    },
  },
};
