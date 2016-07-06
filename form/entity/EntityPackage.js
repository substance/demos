'use strict';

var EntityNode = require('./EntityNode');
var EntityComponent = require('./EntityComponent');
var InsertEntityCommand = require('./InsertEntityCommand');
var InsertEntityTool = require('./InsertEntityTool');

module.exports = {
  name: 'entity',
  configure: function(config) {
    config.addNode(EntityNode);
    config.addComponent(EntityNode.static.name, EntityComponent);
    config.addCommand(InsertEntityCommand);
    config.addTool(InsertEntityTool);
    config.addIcon(InsertEntityCommand.static.name, { 'fontawesome': 'fa-space-shuttle' });
    config.addStyle(__dirname+'/_entity.scss');
    config.addLabel('entity', 'Entity');
    config.addLabel('entity.name', 'Name');
    config.addLabel('entity.description', 'Description');
  }
};
