import React, { ReactElement, ReactNode } from 'react'

/* ---- Slot components ---- */
export function SummaryCardLeft({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
SummaryCardLeft.displayName = 'SummaryCardLeft'

export function SummaryCardRight({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
SummaryCardRight.displayName = 'SummaryCardRight'

/* Main SummaryCard: renders the two-column card structure you provided */
export function SummaryCard({
  children,
  className
}: {
  children?: React.ReactNode
  className?: string
}) {
  // find left/right or fallback
  const left = React.Children.toArray(children).find(
    (c) =>
      React.isValidElement(c) &&
      // eslint-disable-next-line
      (c.type as any).displayName === SummaryCardLeft.displayName
    // eslint-disable-next-line
  ) as ReactElement<any> | undefined

  const right = React.Children.toArray(children).find(
    (c) =>
      React.isValidElement(c) &&
      // eslint-disable-next-line
      (c.type as any).displayName === SummaryCardRight.displayName
    // eslint-disable-next-line
  ) as ReactElement<any> | undefined

  const fallbackRight = React.Children.toArray(children).find(
    (c) =>
      React.isValidElement(c) &&
      // eslint-disable-next-line
      (c.type as any).displayName === SummaryCardLeft.displayName &&
      // eslint-disable-next-line
      (c.type as any).displayName === SummaryCardRight.displayName
    // eslint-disable-next-line
  ) as ReactElement<any> | undefined

  // console.log({ left, right, fallbackRight })
  return (
    <div
      className={
        // wrapper classes exactly as in your snippet
        'md:grid md:grid-cols-2 md:gap-4 md:space-y-0 md:pb-0 pb-4 space-y-4 space-y-reverse flex flex-col-reverse' +
        (className ? ` ${className}` : '')
      }
    >
      <div className="p-4 bg-default-100 rounded">
        {/* Left slot content */}
        {left ? left.props.children : null}
      </div>

      <div className="p-4 bg-default-100 rounded flex items-center">
        {/* Right slot content or fallback */}
        {right ? right.props.children : (fallbackRight ?? null)}
      </div>
    </div>
  )
}
SummaryCard.displayName = 'SummaryCard'

/* Grid that accepts SummaryCard, SummaryCardLeft, SummaryCardRight as children,
   and also allows passing Left/Right directly (they'll be wrapped into a SummaryCard) */
export function SummaryCardGrid({
  children,
  className
}: {
  children?: ReactNode
  className?: string
}) {
  const items = React.Children.toArray(children).filter(React.isValidElement)

  // Normalize into array of SummaryCard elements
  const cards = items.reduce<ReactElement[]>((acc, child, i) => {
    const el = child as ReactElement
    if (el.type === SummaryCard) {
      acc.push(React.cloneElement(el, { key: el.key ?? i }))
      return acc
    }
    // If it's a Left or Right or any other element, try to collect into a single SummaryCard
    if (el.type === SummaryCardLeft || el.type === SummaryCardRight) {
      // wrap single slot element into SummaryCard
      acc.push(<SummaryCard key={el.key ?? i}>{el}</SummaryCard>)
      return acc
    }
    // If it's any other element (e.g., raw SummaryCard content), assume it's meant as a SummaryCard's right content
    acc.push(<SummaryCard key={el.key ?? i}>{el}</SummaryCard>)
    return acc
  }, [])

  return (
    <div
      className={
        'grid grid-cols-1 gap-4 md:divide-none divide-y divide-dashed' +
        (className ? ` ${className}` : '')
      }
    >
      {cards.map((c, idx) => React.cloneElement(c, { key: c.key ?? idx }))}
    </div>
  )
}
SummaryCardGrid.displayName = 'SummaryCardGrid'

/* Optional combined export */
export const Summary = Object.assign(SummaryCard, {
  Left: SummaryCardLeft,
  Right: SummaryCardRight
})
