'use strict';

var Component = require('substance/ui/Component');

function AlienComponent() {
  AlienComponent.super.apply(this, arguments);
}

AlienComponent.Prototype = function() {

  this.didMount = function() {
    this.props.node.on('mood:changed', this.rerender, this);
  };

  this.dispose = function() {
    this.props.node.off(this);
  };

  this.render = function($$) {
    var el = $$('div').addClass('sc-alien sg-hide-selection');
    el.append(
      $$('img').attr('height', 100).attr('src', 'alien/alien.svg')
    );
    if (this.props.node.mood) {
      el.addClass('sm-' + this.props.node.mood);
    }
    // only render the over when not disabled
    if (!this.props.disabled) {
      var overlay = $$('div').addClass('se-overlay').append(
        $$('div').addClass('se-controls').append(
          $$('button').append('Click Here').on('mousedown', this.onMousedown)
        )
      );
      el.append(overlay);
    }
    return el;
  };

  this.getDocument = function() {
    return this.props.node.getDocument();
  };

  var _moods = ['normal', 'angry', 'excited', 'sad', 'sick'];

  this.onMousedown = function(event) {
    event.preventDefault();
    event.stopPropagation();

    var surface = this.context.surface;
    var node = this.props.node;

    var mood = node.mood || 'normal';
    var idx = _moods.indexOf(mood);
    idx = (idx+1) % _moods.length;
    mood = _moods[idx];
    surface.transaction(function(tx) {
      tx.set([node.id, 'mood'], mood);
    });
    this.rerender();
  };

};

Component.extend(AlienComponent);

module.exports = AlienComponent;
