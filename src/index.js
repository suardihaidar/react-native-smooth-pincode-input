import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  I18nManager,
  ViewPropTypes,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
  containerDefault: {},
  cellDefault: {
    borderColor: 'gray',
    borderWidth: 1,
  },
  cellFocusedDefault: {
    borderColor: 'black',
    borderWidth: 2,
  },
  textStyleDefault: {
    color: 'gray',
    fontSize: 24,
  },
  textStyleFocusedDefault: {
    color: 'black',
  },
});

class SmoothPinCodeInput extends Component {

  state = {
    maskDelay: false,
    focused: false,
  };
  ref = React.createRef();
  inputRef = React.createRef();

  shake = () => {
    return this.ref.current.shake(650);
  };

  focus = () => {
    return this.inputRef.current.focus();
  };

  blur = () => {
    return this.inputRef.current.blur();
  };

  _inputCode = (code) => {
    const { password, codeLength = 4, onTextChange, onFulfill } = this.props;

    if (this.props.restrictToNumbers) {
      code = (code.match(/[0-9]/g) || []).join("");
    }

    if (onTextChange) {
      onTextChange(code);
    }
    if (code.length === codeLength && onFulfill) {
      onFulfill(code);
    }

    // handle password mask
    const maskDelay = password &&
      code.length > this.props.value.length; // only when input new char
    this.setState({ maskDelay });

    if (maskDelay) { // mask password after delay
      clearTimeout(this.maskTimeout);
      this.maskTimeout = setTimeout(() => {
        this.setState({ maskDelay: false });
      },
        this.props.maskDelay
      );
    }
  };

  _keyPress = (event) => {
    if (event.nativeEvent.key === 'Backspace') {
      const { value, onBackspace } = this.props;
      if (value === '' && onBackspace) {
        onBackspace();
      }
    }
  };

  _onFocused = (focused) => {
    this.setState({ focused });
  };

  componentWillUnmount() {
    clearTimeout(this.maskTimeout);
  }

  render() {
    const {
      value,
      codeLength, cellSize, cellSpacing,
      placeholder,
      password,
      mask,
      autoFocus,
      containerStyle,
      cellStyle,
      cellStyleFocused,
      cellStyleFilled,
      textStyle,
      textStyleFocused,
      keyboardType,
      animationFocused,
      testID,
      editable,
      inputProps,
    } = this.props;
    const { maskDelay, focused } = this.state;
    return (
      <Animatable.View
        ref={this.ref}
        style={[{
          alignItems: 'stretch', flexDirection: 'row', justifyContent: 'center', position: 'relative',
          width: cellSize * codeLength + cellSpacing * (codeLength - 1),
          height: cellSize,
        },
          containerStyle,
        ]}>
        <View style={{
          position: 'absolute', margin: 0, height: '100%',
          flexDirection: I18nManager.isRTL ? 'row-reverse': 'row',
          alignItems: 'center',
        }}>
          {
            Array.apply(null, Array(codeLength)).map((_, idx) => {
              const cellFocused = focused && idx === value.length;
              const filled = idx < value.length;
              const last = (idx === value.length - 1);
              const showMask = filled && (password && (!maskDelay || !last));
              const isPlaceholderText = typeof placeholder === 'string';
              const isMaskText = typeof mask === 'string';
              const pinCodeChar = value.charAt(idx);

              let cellText = null;
              if (filled || placeholder !== null) {
                if (showMask && isMaskText) {
                  cellText = mask;
                } else if(!filled && isPlaceholderText) {
                  cellText = placeholder;
                } else if (pinCodeChar) {
                  cellText = pinCodeChar;
                }
              }

              const placeholderComponent = !isPlaceholderText ? placeholder : null;
              const maskComponent = (showMask && !isMaskText) ? mask : null;
              const isCellText = typeof cellText === 'string';

              return (
                <Animatable.View
                  key={idx}
                  style={[
                    {
                      width: cellSize,
                      height: cellSize,
                      marginLeft: cellSpacing / 2,
                      marginRight: cellSpacing / 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    cellStyle,
                    cellFocused ? cellStyleFocused : {},
                    filled ? cellStyleFilled : {},
                  ]}
                  animation={idx === value.length && focused ? animationFocused : null}
                  iterationCount="infinite"
                  duration={500}
                >
                  {isCellText && !maskComponent && <Text style={[textStyle, cellFocused ? textStyleFocused : {}]}>
                    {cellText}
                  </Text>}

                  {(!isCellText && !maskComponent) && placeholderComponent}
                  {isCellText && maskComponent}
                </Animatable.View>
              );
            })
          }
        </View>
        <TextInput
          value={value}
          ref={this.inputRef}
          onChangeText={this._inputCode}
          onKeyPress={this._keyPress}
          onFocus={() => this._onFocused(true)}
          onBlur={() => this._onFocused(false)}
          spellCheck={false}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          numberOfLines={1}
          caretHidden
          maxLength={codeLength}
          style={{
            flex: 1,
            opacity: 0,
            textAlign: 'center',
          }}
          testID={testID || undefined}
          editable={editable} 
          {...inputProps} />
      </Animatable.View>
    );
  }

  static defaultProps = {
    value: '',
    codeLength: 4,
    cellSize: 48,
    cellSpacing: 4,
    placeholder: '',
    password: false,
    mask: '*',
    maskDelay: 200,
    keyboardType: 'numeric',
    autoFocus: false,
    restrictToNumbers: false,
    containerStyle: styles.containerDefault,
    cellStyle: styles.cellDefault,
    cellStyleFocused: styles.cellFocusedDefault,
    textStyle: styles.textStyleDefault,
    textStyleFocused: styles.textStyleFocusedDefault,
    animationFocused: 'pulse',
    editable: true,
    inputProps: {},
  };
}

SmoothPinCodeInput.propTypes = {
  value: PropTypes.string,
  codeLength: PropTypes.number,
  cellSize: PropTypes.number,
  cellSpacing: PropTypes.number,

  placeholder: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  mask: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  maskDelay: PropTypes.number,
  password: PropTypes.bool,

  autoFocus: PropTypes.bool,

  restrictToNumbers: PropTypes.bool,

  containerStyle: ViewPropTypes.style,

  cellStyle: ViewPropTypes.style,
  cellStyleFocused: ViewPropTypes.style,

  textStyle: Text.propTypes.style,
  textStyleFocused: Text.propTypes.style,

  animationFocused: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),

  onFulfill: PropTypes.func,
  onChangeText: PropTypes.func,
  onBackspace: PropTypes.func,

  keyboardType: PropTypes.string,
  editable: PropTypes.bool,
  inputProps: PropTypes.exact(TextInput.propTypes),
};

export default SmoothPinCodeInput;
