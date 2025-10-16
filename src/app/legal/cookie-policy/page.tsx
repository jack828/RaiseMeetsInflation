'use client'
import { Button, Card, CardBody, CardHeader } from '@heroui/react'

export default function CookiePolicyPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow p-4">
        <CardHeader className="">
          <h2 className="text-2xl font-semibold">Cookie Policy</h2>
        </CardHeader>

        <CardBody className="space-y-2">
          <script
            id="CookieDeclaration"
            src="https://consent.cookiebot.com/0530b5b9-917c-4879-bab7-83d1c88cfb05/cd.js"
            type="text/javascript"
            async
          ></script>
          <Button onPress={() => window.Cookiebot?.renew()}>
            Change my cookie consent
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
