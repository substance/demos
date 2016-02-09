/*jshint latedef:nofunc */
'use strict';

var exampleDoc = require('../simple/exampleDoc');
var MessageQueue = require('substance/util/MessageQueue');
var WebSocketServer = require('substance/util/WebSocketServer');
var CollabSession = require('substance/model/CollabSession');
var Icon = require('substance/ui/FontAwesomeIcon');
var StubHub = require('substance/util/StubHub');
var Component = require('substance/ui/Component');
var SplitPane = require('substance/ui/SplitPane');
var Editor = require('../simple/Editor');
var $$ = Component.$$;

window.onload = function() {
  var debug = (window.location.hash === '#debug');
  window.app = TwoEditors.static.mount({
    debug: debug
  }, 'body');
};

function TwoEditors() {
  TwoEditors.super.apply(this, arguments);

  this.messageQueue = new MessageQueue();
  this.messageQueue.start();

  // Two edited docs, one doc instance on the hub all with the same contents,
  // now we start synchronizing them.
  this.doc1 = exampleDoc();
  this.doc2 = exampleDoc();
  this.hubDoc = exampleDoc();

  this.wss = new WebSocketServer(this.messageQueue);
  this.hub = new StubHub(this.hubDoc, this.wss);

  // Create two CollabSessions for the same doc
  this.session1 = new CollabSession(this.doc1, {
    messageQueue: this.messageQueue,
    autorun: false
  });
  this.session2 = new CollabSession(this.doc2, {messageQueue: this.messageQueue});

  this.handleActions({
    'toggleDebug': this._toggleDebug,
    'processNextMessage': this._processNextMessage,
    'commit': this._onCommit
  });

  this._debug = this.props.debug;

  if (this._debug) {
    this.messageQueue.stop();
    this.session1.stop();
    this.session2.stop();
  }
}

TwoEditors.Prototype = function() {


  this.render = function() {
    var el = $$('div').addClass('sc-two-editors');
    var statusEl = $$(Status, {
      messageQueue: this.messageQueue,
      debug: this._debug
    }).ref('statusEl').ref('status');

    var leftEditor = $$(Editor, {
      documentSession: this.session1
    }).ref('left').addClass('left-editor');

    leftEditor.outlet('tools').append(
      $$(CommitTool, { session: this.session1 })
    );

    var rightEditor = $$(Editor, {
      documentSession: this.session2
    }).ref('right').addClass('right-editor');

    rightEditor.outlet('tools').append(
      $$(CommitTool, { session: this.session2 })
    );

    el.append(
      $$(SplitPane, {splitType: 'horizontal', sizeB: 'inherit'}).append(
        $$(SplitPane, {
          splitType: 'vertical',
          sizeA: '50%'
        }).append(
          leftEditor,
          rightEditor
        ),
        statusEl
      )
    );
    return el;
  };

  this._toggleDebug = function() {
    if (!this._debug) {
      this.messageQueue.stop();
      this.session1.stop();
      this.session2.stop();
    } else {
      this.messageQueue.start();
      this.session1.start();
      this.session2.start();
    }
    this._debug = !this._debug;
    this.refs.status.extendProps({
      debug: this._debug
    });
  };

  this._processNextMessage = function() {
    this.messageQueue.tick();
  };

  this._onCommit = function(evt) {
    console.log('Commit');
    evt.stopPropagation();
  };

};

Component.extend(TwoEditors);

function Status() {
  Status.super.apply(this, arguments);
}

Status.Prototype = function() {

  this.didMount = function() {
    this.props.messageQueue.connect(this, {
      'messages:updated': this._onMessagesUpdated
    });
  };

  this.dispose = function() {
    this.props.messageQueue.disconnect(this);
  };

  this.render = function() {
    var statusEl = $$('div').addClass('se-status');

    if (this.props.debug) {
      statusEl.append(
        $$('div').addClass('se-left').append(
          this.props.messageQueue.messages.length+' messages in the air ',
          $$('button').addClass('se-next-message')
            .append($$(Icon, {icon: 'fa-step-forward'})).on('click', this._processNextMessage),
          $$('button').addClass('se-dump-messages')
            .append($$(Icon, {icon: 'fa-tasks'}))
            .attr({ title: 'Dump MessageQueue'})
            .on('click', this._dumpMessageQueue)
        ),
        $$('div').addClass('se-right').append(
          $$('button').addClass('se-debug')
            .append($$(Icon, {icon: 'fa-toggle-off'}), ' Network')
            .on('click', this._toggleDebug)
        )
      );
    } else {
      statusEl.append(
        $$('div').addClass('se-left').append(
          this.props.messageQueue.messages.length+' messages in the air '
        ),
        $$('div').addClass('se-right').append(
          $$('button').addClass('se-debug')
            .append($$(Icon, {icon: 'fa-toggle-on'}), ' Network')
            .on('click', this._toggleDebug)
        )
      );
    }
    return statusEl;
  };

  this._onMessagesUpdated = function(/*messages*/) {
    this.rerender();
  };

  this._toggleDebug = function() {
    this.send('toggleDebug');
  };

  this._processNextMessage = function() {
    this.send('processNextMessage');
  };

  this._dumpMessageQueue = function() {
    console.log(JSON.stringify(this.props.messageQueue.messages));
  };

};

function CommitTool() {
  CommitTool.super.apply(this, arguments);
}

CommitTool.Prototype = function() {

  this.didMount = function() {
    this.props.session.getDocument().connect(this, {
      'document:changed': this.afterDocumentChange
    }, { priority: -10 });
  };

  this.dispose = function() {
    this.props.messageQueue.disconnect(this);
  };

  this.render = function() {
    var el = $$('div')
      .attr('title', 'Commit')
      .addClass('se-tool')
      .append(
        $$('button')
          .append($$(Icon, {icon: 'fa-send'}))
          .on('click', this.onClick)
    );
    if (this.state.disabled) {
      el.addClass('sm-disabled');
    }
    return el;
  };

  this.getInitialState = function() {
    return {
      disabled: !this.props.session.nextCommit
    };
  };

  this.afterDocumentChange = function() {
    var newState = {};
    newState.visible = !!this.props._runner;
    newState.disabled = !this.props.session.nextCommit;
    this.setState(newState);
  };

  this.onClick = function() {
    this.props.session.commit();
    this.afterDocumentChange();
  };

};

Component.extend(CommitTool);

Component.extend(Status);
