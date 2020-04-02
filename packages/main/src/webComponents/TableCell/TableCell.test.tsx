import { TableCell } from '@ui5/webcomponents-react/lib/TableCell';
import { mount } from 'enzyme';
import React from 'react';

describe('TableCell', () => {
  test('Basic Test (generated)', () => {
    const wrapper = mount(<TableCell />);
    expect(wrapper.render()).toMatchSnapshot();
  });
});
