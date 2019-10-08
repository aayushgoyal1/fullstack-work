import React, { Component } from 'react';
import { List } from './List';
import PropTypes from 'prop-types';

// Given an API endpoint that gives JSON, show it as a list.
export class JSONList extends Component {
  state = { items: [] };

  componentDidMount = async () => {
    let items = await fetch(this.props.api);
    items = await items.json();
    if (this.props.transform) {
      items = this.props.transform(items);
    }
    items = items.map((item, id) => {
      item.key = id;
      return item;
    });
    this.setState({ items });
  };

  render = () => {
    const onClick =
      typeof this.props.onClick === 'function'
        ? this.props.onClick
        : ({ _id }) =>
            this.props.onClick.history.push(this.props.onClick.url + _id);

    let secondaryOption = undefined;
    if (this.props.onSecondaryClick && this.props.secondaryIcon) {
      secondaryOption = {
        iconName: this.props.secondaryIcon,
        onClick:
          typeof this.props.onSecondaryClick === 'function'
            ? this.props.onSecondaryClick
            : ({ _id }) =>
                this.props.onSecondaryClick.history.push(
                  this.props.onSecondaryClick.url + _id
                )
      };
    }

    return (
      <List
        items={this.state.items}
        onClick={onClick}
        secondaryOption={secondaryOption}
      />
    );
  };
}

JSONList.propTypes = {
  api: PropTypes.string.isRequired, // The API URL that is to be fetched
  transform: PropTypes.func, // Can be used to transform the data from the API
  onClick: PropTypes.oneOfType([
    // If onClick is a function, it will be called when someone clicks on an item of the list, and it will be given the item that was clicked
    PropTypes.func,
    // Or, we can build an onClick function that will bring you to a URL followed by the _id of the item that is clicked:
    PropTypes.exact({
      url: PropTypes.string,
      history: PropTypes.object
    })
  ]).isRequired,
  onSecondaryClick: PropTypes.oneOfType([
    // If onClick is a function, it will be called when someone clicks on an item of the list, and it will be given the item that was clicked
    PropTypes.func,
    // Or, we can build an onClick function that will bring you to a URL followed by the _id of the item that is clicked:
    PropTypes.exact({
      url: PropTypes.string,
      history: PropTypes.object
    })
  ]),
  secondaryIcon: PropTypes.string
};
