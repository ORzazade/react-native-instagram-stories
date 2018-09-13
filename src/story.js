import React from 'react'
import { StyleSheet, View, Dimensions, TouchableWithoutFeedback } from 'react-native'
import { observer } from 'mobx-react/native'
import store from './store'
import Expo from 'expo'
import Indicator from './indicator'
import Image from 'react-native-image-progress'
import * as Progress from 'react-native-progress'

const circleSnailProps = { thickness: 1, color: '#ddd', size: 80 }
const { width, height } = Dimensions.get('window')

export default class extends React.Component {

  renderCloseButton() {
    const { dismissCarousel } = this.props
    return (
      <TouchableWithoutFeedback onPress={dismissCarousel}>
        <View style={styles.closeButton}>
          <View style={[styles.closeCross, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.closeCross, { transform: [{ rotate: '-45deg' }] }]} />
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderIndicators() {
    const { story, currentDeck, indicatorAnim } = this.props

    return (
      <View style={styles.indicatorWrap}>
        <Expo.LinearGradient
          colors={['rgba(0,0,0,0.33)', 'transparent']}
          locations={[0, 0.95]}
          style={styles.indicatorBg}
        />

        <View style={styles.indicators}>
          {story.items.map((item, i) => (
            <Indicator
              indicatorAnim={indicatorAnim}
              key={i} i={i}
              animate={currentDeck && story.idx == i}
              story={story}
            />
          ))}
        </View>
      </View>
    )
  }

  renderBackButton() {
    const { onPrevItem, setBackOpacity, backOpacity } = this.props
    return (
      <TouchableWithoutFeedback
        onPress={onPrevItem}
        onPressIn={() => setBackOpacity(1)}
        onLongPress={() => setBackOpacity(0)}
      >
        <Expo.LinearGradient
          colors={['rgba(0,0,0,0.33)', 'transparent']}
          locations={[0, 0.85]}
          start={[0, 0]}
          end={[1, 0]}
          style={[styles.back, {
            opacity: backOpacity
          }]}
        />
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const { story, onNextItem, pause, dismissCarousel } = this.props

    return (
      <TouchableWithoutFeedback
        onPress={onNextItem}
        delayPressIn={200}
        onPressIn={pause}
      >
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: story.items[story.idx].src }}
            style={styles.deck}
            indicator={Progress.CircleSnail}
            indicatorProps={circleSnailProps}
          />
          {this.renderIndicators()}
          {this.renderCloseButton()}
          {this.renderBackButton()}
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  deck: {
    width, height,
    backgroundColor: 'white'
  },

  progressIndicator: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },

  indicatorWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0
  },
  indicators: {
    height: 30,
    alignItems: 'center',
    paddingHorizontal: 8,
    flexDirection: 'row'
  },
  indicatorBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 50
  },

  back: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 90
  },

  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 70,
    height: 70,
    zIndex: 1
  },
  closeCross: {
    position: 'absolute',
    top: 32, right: 8,
    width: 20,
    height: 1,
    backgroundColor: '#fff'
  }
})
