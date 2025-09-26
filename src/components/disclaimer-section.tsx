import { Card, CardHeader, CardBody } from '@heroui/react'
//
export const DisclaimerSection: React.FC = () => {
  return (
    <Card className="shadow p-4">
      <CardHeader>
        <h1 className="text-2xl font-semibold">Disclaimer & Sources</h1>
      </CardHeader>

      <CardBody className="space-y-2">
        <p className="text-sm text-default-600">
          This tool provides illustrative, approximate comparisons between your
          nominal salary changes and UK inflation. Information provided on this
          site is for illustrative purposes only. Do not make any major
          financial decisions without consulting a qualified specialist.
        </p>

        <ul className="list-disc ml-5 text-sm text-default-600">
          <li>
            Calculations use monthly CPIH/CPI annual rates converted to monthly
            multipliers and compounded between the selected months - different
            methods (e.g. interpolating daily rates, or using alternative
            indexing) will produce different results.
          </li>
          <li>
            Inflation data sourced from the UK Office for National Statistics
            (ONS):
            <div className="mt-1 space-y-1">
              <a
                className="text-primary-600"
                href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/l55o/mm23"
                target="_blank"
                rel="noreferrer"
              >
                ONS - CPIH ANNUAL RATE 00: ALL ITEMS 2015=100
              </a>
              <br />
              <a
                className="text-primary-600"
                href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23"
                target="_blank"
                rel="noreferrer"
              >
                ONS - CPI ANNUAL RATE 00: ALL ITEMS 2015=100
              </a>
            </div>
          </li>

          <li>
            Pay growth data sourced from the UK Office for National Statistics
            (ONS):
            <div className="mt-1 space-y-1">
              <a
                className="text-primary-600"
                href="https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/realtimeinformationstatisticsreferencetablenonseasonallyadjusted"
                target="_blank"
                rel="noreferrer"
              >
                Earnings and employment from Pay As You Earn Real Time
                Information, non-seasonally adjusted [27. Median of Pay Growth
                (UK)]
              </a>
              <br />
              <strong>
                Pay growth varies wildly depending on industry and your specific
                job role.
              </strong>
            </div>
          </li>

          <li>
            None of your salary information leaves your browser. If you choose
            to screenshot or download a copy of the page, then it only exists
            with you.
          </li>
          <li>
            This is not financial, tax, or employment advice. For important
            decisions, consult a qualified professional.
          </li>
        </ul>

        <p className="text-sm text-default-600">
          Data last updated on TODO DATE. Some figures take time to release and
          therefore may be out of date until the data sources used publish new
          versions.
        </p>
      </CardBody>
    </Card>
  )
}
