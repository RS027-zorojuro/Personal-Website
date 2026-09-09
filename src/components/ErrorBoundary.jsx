/**
 * ErrorBoundary — the single error-containment primitive for the site.
 *
 * One world failing must never take down the page. Each world root is
 * wrapped in this; the fallback is written in the site's own visual
 * language (mono kicker, hairline rule, restrained vermilion) rather
 * than a browser default or a generic card.
 *
 * This matters most for Cars: React Three Fiber deliberately re-throws any
 * error raised inside its <Canvas> out into the surrounding tree, so without
 * a boundary a single bad model or a lost GPU context blanks the section.
 *
 * Do not add a second boundary implementation — extend this one.
 */

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, attempt: 0 };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface for debugging without taking the page with it.
    console.error(
      "[" + (this.props.label || "world") + "] contained failure:",
      error,
      info && info.componentStack
    );
    if (this.props.onError) this.props.onError(error);
  }

  /**
   * Remount the subtree. Transient causes — a dropped request, a GPU context
   * lost when the machine woke from sleep — recover on a second attempt, and
   * a dead end with no way back is a worse failure than the original one.
   * The bumped `attempt` is used as a key so children rebuild from scratch
   * rather than resuming whatever state failed.
   */
  retry() {
    this.setState((prev) => ({ error: null, attempt: prev.attempt + 1 }));
  }

  render() {
    if (!this.state.error) {
      return (
        <React.Fragment key={this.state.attempt}>
          {this.props.children}
        </React.Fragment>
      );
    }

    return (
      <div className="world-fault" role="status" aria-live="polite">
        <p className="world-fault-kicker">{this.props.title || "UNAVAILABLE"}</p>
        <p className="world-fault-line">
          {this.props.message || "This section could not be displayed."}
        </p>
        {this.props.hint ? (
          <p className="world-fault-hint">{this.props.hint}</p>
        ) : null}
        <button type="button" className="world-fault-retry" onClick={this.retry}>
          TRY AGAIN
        </button>
      </div>
    );
  }
}
