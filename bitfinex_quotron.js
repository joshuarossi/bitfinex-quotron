var blessed = require('blessed');
var _ = require('lodash');
var util = require('util');
var BitfinexWS = require ('bitfinex-api-node').WS;

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
  dockBorders: true
});

screen.title = 'Bitfinex';

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  align: 'center',
  top: 'top',
  left: 'center',
  width: '75%',
  height: '30%',
  content: 'Bitfinex',
  tags: true,
  style: {
    fg: 'green',
  }
});

tickers = blessed.box({
  label: 'Ticker',
  top: '100',
  left: 'center',
  height:"20%",
  content: '',
  width: "75%",
  border: {
    type: 'line'
  },
    style: {
      fg: 'green'
  }
});
trades = blessed.box({
  label: 'Trades',
  bottom: 0,
  right: 0,
  height:'70%',
  width: '30%',
  border: {
    type: 'line'
  },
    style: {
      fg: 'green'
  }
});

bids = blessed.box({
  align: 'right',
  label: 'Bids',
  bottom: 0,
  left: 0,
  height:'70%',
  width: '30%',
  border: {
    type: 'line'
  },
    style: {
      fg: 'green'
  }
});
asks = blessed.box({
  label: 'Asks',
  bottom: 0,
  left: 'center',
  height:'70%',
  width: '30%',
  border: {
    type: 'line'
  },
    style: {
      fg: 'green'
  }
});
// box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}')
// Append our box to the screen.
screen.append(box);
screen.append(trades);
screen.append(bids);
screen.append(asks);
screen.append(tickers);
// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// Focus our element.
box.focus();

// Render the screen.
screen.render();

var bws = new BitfinexWS();

bws.on('open', function () {
    bws.subscribeTrades('BTCUSD');
    bws.subscribeTicker('BTCUSD');
    bws.subscribeOrderBook('BTCUSD')
});

bws.on('trade', function (pair, trade) {
  line = trade.price.toFixed(2) + " | " + Math.abs(trade.amount).toFixed(5);
  trades.insertLine(0, line);
  screen.render();
});

bws.on('ticker', function(pair, ticker) {
  tickers.setContent(
  "Bid: " + ticker.bid + "\n" + "Bid Size: " + ticker.bidSize + "\n" + "Ask: " + ticker.ask + "\n" +"Ask Size: " + ticker.askSize + "\n" + "Last Price: " + ticker.lastPrice + "\n" + "High: " + ticker.high + "\n" + "Low: " + ticker.low + "\n"+ "Volume: " + ticker.volume
    );
  screen.render();
});


order_bids_by_price = function (a, b) {
  if (a.price < b.price) {
    return 1;
  }
  if (a.price > b.price) {
    return -1;
  }
  // a must be equal to b
  return 0;
}
order_asks_by_price = function (a, b) {
  if (a.price > b.price) {
    return 1;
  }
  if (a.price < b.price) {
    return -1;
  }
  // a must be equal to b
  return 0;
}
bids_array = [];
asks_array = [];
bws.on('orderbook', function (pair, book) {
  if(book.amount > 0) {
    _.remove(bids_array, function(n){
          return n.price == book.price;
    })
    if (book.count != 0) {
      bids_array.push(book);
      bids_array.sort(order_bids_by_price);
    }
    bids_display = bids_array.map(function(a){
      return util.format("   %s   |   %s", a.amount, a.price.toFixed(2));
    });
    bids.setContent('');
    bids.insertLine(0, bids_display);
    screen.render();
    }
  if(book.amount < 0) {
      _.remove(asks_array, function(n){
          return n.price == book.price;
      })
      if (book.count != 0) {
        asks_array.push(book);
        asks_array.sort(order_asks_by_price);
      }
      asks_display = asks_array.map(function(a){
        return util.format("%s   |   %s   ", a.price.toFixed(2), Math.abs(a.amount));
    });
    asks.setContent('');
    asks.insertLine(0, asks_display);
    screen.render();
    }
});


