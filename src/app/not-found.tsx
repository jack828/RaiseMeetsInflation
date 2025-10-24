'use client'
import { Card, CardBody, CardHeader } from '@heroui/react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <Card className="shadow p-4">
        <CardHeader className="">
          <h2 className="text-4xl font-semibold">404</h2>
        </CardHeader>

        <CardBody className="space-y-2">
          <p>Looks like you&apos;re a bit lost there.</p>

          <p className='text-blue-400'>
            <Link href="/">Why don&apos;t you head back home?</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
