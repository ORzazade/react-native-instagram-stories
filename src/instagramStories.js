import React, { Component } from 'react'
import { LayoutAnimation, Animated, Dimensions, StyleSheet, View, TouchableWithoutFeedback, PanResponder, UIManager, Platform } from 'react-native'
import Stories from './stories'
import store from './store'
import data from './data'
import Bubbles from './bubbles'

const { width, height } = Dimensions.get('window')
const VERTICAL_THRESHOLD = 80
const HORIZONTAL_THRESHOLD = 60

export default class InstagramStories extends Component {
  constructor(props) {
    super(props)

    this.state = {
      carouselOpen: false,
      offset: { top: height / 2, left: width / 2 },
      stories: data,
      deckIdx: 0,
      paused: false,
      backOpacity: 0,
      indicatorAnim: new Animated.Value(0),
      horizontalSwipe: new Animated.Value(0),
      verticalSwipe: new Animated.Value(0),
      swipedHorizontally: true,
      panResponder: PanResponder.create({
        onMoveShouldSetResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: (evt, { dx, dy }) => {
          if (Math.abs(dx) > 5) {
            this.state.swipedHorizontally = true
            return true
          }

          if (dy > 5) {
            this.state.swipedHorizontally = false
            return true
          }

          return false
        },

        onPanResponderGrant: () => {
          if (this.state.swipedHorizontally) {
            this.state.horizontalSwipe.setOffset(this.state.horizontalSwipe._value)
            this.state.horizontalSwipe.setValue(0)
          }

          this.pause()
          this.setBackOpacity(0)
        },

        onPanResponderMove: (e, { dx, dy }) => {
          if (this.state.swipedHorizontally) {
            this.state.horizontalSwipe.setValue(-dx)
          } else {
            this.state.verticalSwipe.setValue(dy)
          }
        },

        onPanResponderRelease: (e, { dx, dy }) => {
          if (!this.state.swipedHorizontally) {
            if (dy > VERTICAL_THRESHOLD) { return this.leaveStories() }
            this.play()
            return this.resetVerticalSwipe()
          }

          this.state.horizontalSwipe.flattenOffset()
          const deckIdx = this.state.deckIdx

          if (dx > HORIZONTAL_THRESHOLD) { // previous deck
            if (deckIdx == 0) { return this.leaveStories() }

            return this.animateDeck(width * (deckIdx - 1), true)
          }

          if (dx < -HORIZONTAL_THRESHOLD) { // -> next deck
            if (deckIdx == this.state.stories.length - 1) { return this.leaveStories() }

            return this.animateDeck(width * (deckIdx + 1), true)
          }

          this.play()
          return this.animateDeck(width * deckIdx)
        }
      })
    }

  }
  componentWillMount() {
    if (Platform.OS == 'android') { UIManager.setLayoutAnimationEnabledExperimental(true) }
  }


  ///////////////////////////////////
  // Toggle Carousel
  ///////////////////////////////////

  openCarousel = (idx, offset) => {
    this.setState({ offset })
    this.setDeckIdx(idx)
    this.state.horizontalSwipe.setValue(idx * width)

    requestAnimationFrame(() => {
      LayoutAnimation.easeInEaseOut()
      this.setState({ carouselOpen: true })
      this.animateIndicator()
    })
  }

  dismissCarousel = () => {
    LayoutAnimation.easeInEaseOut()
    this.setState({ carouselOpen: false })
  }

  leaveStories() {
    console.log('leaveStories')
    if (this.state.swipedHorizontally) {
      this.animateDeck((width * this.state.deckIdx))
    } else {
      this.resetVerticalSwipe()
    }

    this.dismissCarousel()
  }

  ///////////////////////////////////
  // Setter Methods
  ///////////////////////////////////

  setPaused = (paused) => {
    this.setState({ paused })
  }

  setDeckIdx = (deckIdx) => {
    this.setState({ deckIdx })
  }

  setBackOpacity = (backOpacity) => {
    this.setState({ backOpacity })
  }

  setStoryIdx = (idx) => {
    let stories = this.state.stories
    stories[this.state.deckIdx].idx = idx
    console.log('setStoryIdx', idx)
    this.setState({ idx, stories })
  }

  ///////////////////////////////////
  // Toggle Indicator Animation
  ///////////////////////////////////

  pause = () => {
    this.setPaused(true)
    this.state.indicatorAnim.stopAnimation()
  }

  play = () => {
    if (this.state.paused) {
      this.setPaused(false)
      this.animateIndicator(false)
    }
  }

  animateIndicator = (reset = true) => {
    if (reset) { this.state.indicatorAnim.setValue(0) }

    requestAnimationFrame(() => {
      Animated.timing(this.state.indicatorAnim, {
        toValue: 1,
        duration: 5000 * (1 - this.state.indicatorAnim._value)
      }).start(({ finished }) => {
        if (finished) { this.onNextItem() }
      })
    })
  }

  resetVerticalSwipe() {
    Animated.spring(this.state.verticalSwipe, { toValue: 0 }).start()
  }

  ///////////////////////////////////
  // Navigate Story Items
  ///////////////////////////////////

  onNextItem = () => {
    console.log('onNextItem', this.state.paused, this.currentStory())
    if (this.state.paused) { return this.play() }

    const story = this.currentStory()

    if (story.idx >= story.items.length - 1) { return this.onNextDeck() }

    this.animateIndicator()
    this.setStoryIdx(Number(story.idx) + 1)
  }

  onPrevItem = () => {
    if (this.state.backOpacity == 1) { this.setBackOpacity(0) }

    const story = this.currentStory()

    if (story.idx == 0) { return this.onPrevDeck() }

    this.animateIndicator()
    this.setStoryIdx(story.idx - 1)
  }
  ///////////////////////////////////
  // Navigate Deck Items
  ///////////////////////////////////

  onNextDeck = () => {
    if (this.state.deckIdx >= this.state.stories.length - 1) { return this.leaveStories() };
    this.animateDeck((this.state.deckIdx + 1) * width, true)
  }

  onPrevDeck = () => {
    if (this.state.deckIdx == 0) { return this.leaveStories() }
    this.animateDeck((this.state.deckIdx - 1) * width, true)
  }

  animateDeck = (toValue, reset = false) => {
    if (reset) {
      this.setDeckIdx(parseInt(toValue / width))
      this.animateIndicator()
    }

    Animated.spring(this.state.horizontalSwipe, {
      toValue, friction: 9
    }).start()
  }
  ///////////////////////////////////
  // Computed properties
  ///////////////////////////////////

  currentStory = () => {
    if (this.state.stories.length <= 0) { return null }
    return this.state.stories[this.state.deckIdx]
  }
  render() {
    return (
      <View style={styles.container}>
        <Bubbles stories={this.state.stories} openCarousel={this.openCarousel} />

        <View style={[
          styles.carouselWrap,
          this.state.offset,
          (this.state.carouselOpen ? styles.open : styles.closed)
        ]}>
          {
            this.state.panResponder &&
            <Stories
              swipedHorizontally={this.state.swipedHorizontally}
              horizontalSwipe={this.state.horizontalSwipe}
              verticalSwipe={this.state.verticalSwipe}
              deckIdx={this.state.deckIdx}
              panResponder={this.state.panResponder}
              stories={this.state.stories}
              openCarousel={this.openCarousel}
              onNextItem={this.onNextItem}
              pause={this.state.pause}
              dismissCarousel={this.dismissCarousel}
              // currentDeck={currentDeck}
              onPrevItem={this.onPrevItem}
              setBackOpacity={this.setBackOpacity}
              backOpacity={this.state.backOpacity}
              indicatorAnim={this.state.indicatorAnim}
            />
          }

        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  carouselWrap: {
    overflow: 'hidden',
    position: 'absolute'
  },
  closed: {
    width: 0,
    height: 0
  },
  open: {
    width, height,
    top: 0,
    left: 0
  },

  btn: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    backgroundColor: 'black'
  }
})
