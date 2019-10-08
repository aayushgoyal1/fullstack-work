import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Card, Icon } from 'semantic-ui-react';
import '../../css/index.css';

export function List(props) {
  if (props.items.length === 0) {
    return <div>Nothing found</div>;
  }
  return (
    <div>
      <Grid stackable columns={4}>
        {props.items.map(item => (
          <Grid.Column key={item._id}>
            <Card onClick={() => props.onClick(item)}>
              <Card.Content
                header={
                  <p>
                    {item.name}
                    {props.secondaryOption ? (
                      <Icon
                        link
                        style={{ float: 'right' }}
                        onClick={e => {
                          e.stopPropagation();
                          props.secondaryOption.onClick(item);
                        }}
                        name={props.secondaryOption.iconName}
                      />
                    ) : null}
                  </p>
                }
              />
              {item.description ? (
                <Card.Content description>{item.description}</Card.Content>
              ) : null}
            </Card>
          </Grid.Column>
        ))}
      </Grid>
    </div>
  );
}

List.propTypes = {
  onClick: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      _id: PropTypes.string.isRequired
    })
  ).isRequired,
  // secondaryOption is used for when there's another thing to click on, like an icon on the right
  secondaryOption: PropTypes.shape({
    iconName: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  })
};
