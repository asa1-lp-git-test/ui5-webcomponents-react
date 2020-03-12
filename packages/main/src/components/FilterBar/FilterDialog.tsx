import '@ui5/webcomponents-icons/dist/icons/search';
import { Button } from '@ui5/webcomponents-react/lib/Button';
import { ButtonDesign } from '@ui5/webcomponents-react/lib/ButtonDesign';
import { Dialog } from '@ui5/webcomponents-react/lib/Dialog';
import { FlexBox } from '@ui5/webcomponents-react/lib/FlexBox';
import { FlexBoxDirection } from '@ui5/webcomponents-react/lib/FlexBoxDirection';
import { FlexBoxJustifyContent } from '@ui5/webcomponents-react/lib/FlexBoxJustifyContent';
import { Text } from '@ui5/webcomponents-react/lib/Text';
import { Title } from '@ui5/webcomponents-react/lib/Title';
import React, { Children, cloneElement, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Bar, CheckBox, FlexBoxAlignItems, Icon, Input, TitleLevel } from '../..';
import { BarDesign } from '../../enums/BarDesign';
import styles from './FilterBarDialog.jss';
import { addRef, renderSearchWithValue } from './utils';
import { Event } from '@ui5/webcomponents-react-base/lib/Event';
// import { Input } from '@ui5/webcomponents-react/lib/Input';

//todo check dependencies arrays
const useStyles = createUseStyles(styles, { name: 'FilterBar' });
export const FilterDialog = (props) => {
  const {
    open,
    handleDialogClose,
    children,
    showClearButton,
    showRestoreButton,
    showGoButton,
    showSearch,
    renderFBSearch,
    handleClearFilters,
    handleRestoreFilters,
    handleDialogSave,
    searchValue,
    handleSearchValueChange,
    handleGo,
    handleSelectionChange,
    handleDialogSearch
  } = props;
  const classes = useStyles();
  const [searchString, setSearchString] = useState('');
  const [refs, setRefs] = useState([]);
  const searchRef = useRef(null);
  const [activeFilters, setActiveFilters] = useState({});

  const initRefs = useCallback(() => {
    let refs = [];
    const newChildren = children.map((child, index) => {
      const childrenRef = (node) => {
        refs.push({ node, key: child.key });
        return node;
      };
      const filterChildren = child.props.children;
      return cloneElement(child as ReactElement<any>, {
        children: { ...filterChildren, ref: childrenRef }
      });
    });
    setRefs(refs);
    return newChildren;
  }, []);

  const [childrenWithNewRef, setChildrenWithRef] = useState(initRefs);

  useEffect(() => {
    const visibleChildren = children.filter((child) => child.props.visible !== false);
    setChildrenWithRef(visibleChildren);
  }, [children, setChildrenWithRef]);

  const handleSearch = useCallback(
    (e) => {
      handleDialogSearch(Event.of(null, e.getOriginalEvent(), { value: e.parameters.value }));
      setSearchString(e.parameters.value);
    },
    [setSearchString]
  );
  const handleSave = useCallback(
    (e) => {
      //todo Event.of
      handleDialogSave(
        e,
        addRef(childrenWithNewRef, refs, 'dialogRef'),
        Object.keys(activeFilters).length > 0
          ? Object.keys(activeFilters).map((item) => activeFilters[item])
          : undefined
      );
      if (showSearch) {
        handleSearchValueChange(searchRef.current?.children[1]._state.value);
      }
    },
    [handleDialogSave, childrenWithNewRef, refs, activeFilters, showSearch, handleSearchValueChange, searchRef]
  );

  const handleClose = useCallback(
    (e) => {
      if (!showGoButton) {
        handleSave(e);
        return;
      }
      handleDialogClose(e);
    },
    [showGoButton, handleSave, handleDialogClose]
  );

  const handleDialogGo = useCallback(
    (e) => {
      handleGo(Event.of(null, e.getOriginalEvent()), {});
      handleDialogClose(e);
    },
    [handleGo, handleDialogClose]
  );

  const handleRestore = useCallback(
    (e) => {
      handleRestoreFilters(e, 'dialog');
    },
    [handleRestoreFilters]
  );

  const renderFooter = useCallback(() => {
    return (
      <Bar
        design={BarDesign.Footer}
        renderContentRight={() => (
          <FlexBox justifyContent={FlexBoxJustifyContent.End} className={classes.footer}>
            {showGoButton && (
              <Button onClick={handleDialogGo} design={ButtonDesign.Emphasized}>
                Go
              </Button>
            )}
            {showClearButton && <Button onClick={handleClearFilters}>Clear</Button>}
            {showRestoreButton && <Button onClick={handleRestore}>Restore</Button>}
            <Button onClick={handleSave}>Save</Button>
            <Button design={ButtonDesign.Transparent} onClick={handleClose}>
              Cancel
            </Button>
          </FlexBox>
        )}
      />
    );
  }, [
    showClearButton,
    showRestoreButton,
    classes.footer,
    showGoButton,
    handleSave,
    handleClose,
    handleRestore,
    handleClearFilters
  ]);

  const renderHeader = useCallback(
    () => (
      <FlexBox direction={FlexBoxDirection.Column} className={classes.header}>
        <Title level={TitleLevel.H4}>Filters</Title>
        {showSearch && <Input placeholder="Search for Filters" onInput={handleSearch} icon={<Icon name="search" />} />}
      </FlexBox>
    ),
    [classes.header, showSearch, handleSearch]
  );

  const renderChildren = useCallback(() => {
    const currentChildren = childrenWithNewRef
      .map((child) => {
        if (child.props.label?.toLowerCase().includes(searchString.toLowerCase()) || searchString.length === 0) {
          return child;
        }
      })
      .filter(Boolean);
    return currentChildren;
  }, [childrenWithNewRef, searchString]);

  const handleCheckBoxChange = useCallback(
    (element, activeFilters) => (e) => {
      handleSelectionChange(
        Event.of(null, e.getOriginalEvent(), { element: { event: e, element }, checked: e.parameters.checked })
      );
      setActiveFilters({ ...activeFilters, [element.key]: { event: e, element } });
    },
    [setActiveFilters]
  );

  const renderSearch = useCallback(() => {
    return renderSearchWithValue(renderFBSearch, searchValue);
  }, [renderFBSearch, searchValue]);

  const renderGroups = useCallback(() => {
    let groups = {};
    Children.forEach(renderChildren(), (child) => {
      const childGroups = child.props.groupName ?? 'default';
      if (groups[childGroups]) {
        groups[childGroups].push(child);
      } else {
        groups[childGroups] = [child];
      }
    });
    return Object.keys(groups)
      .sort((x, y) => (x === 'default' ? -1 : y === 'role' ? 1 : 0))
      .map((item, index) => {
        const filters = groups[item].map((el) => {
          return (
            <div className={classes.singleFilter} key={`${el.key}-container`}>
              {el}
              <CheckBox
                checked={el.props.visibleInFilterBar || el.props.mandatory}
                onChange={handleCheckBoxChange(el, activeFilters)}
                disabled={el.props.mandatory}
              />
            </div>
          );
        });
        return (
          <div className={classes.groupContainer} key={item}>
            <FlexBox justifyContent={FlexBoxJustifyContent.SpaceBetween} alignItems={FlexBoxAlignItems.Center}>
              <Title level={TitleLevel.H5} className={index === 0 ? classes.groupTitle : ''}>
                {item === 'default' ? 'Basic' : item}
              </Title>
              {index === 0 && <Text wrapping={false}>Show on Filter Bar</Text>}
            </FlexBox>
            <div className={classes.filters}>{filters}</div>
          </div>
        );
      });
  }, [renderChildren, activeFilters]);

  return (
    <Dialog open={open} onAfterClose={handleClose} header={renderHeader()} footer={renderFooter()}>
      <div className={classes.dialog}>
        {renderFBSearch && (
          <div className={classes.fbSearch} ref={searchRef}>
            <span />
            {renderSearch()}
          </div>
        )}
        {renderGroups()}
      </div>
    </Dialog>
  );
};