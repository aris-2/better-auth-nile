"use client"
import Primitive from "@uiw/react-json-view"

type JsonViewSectionProps = {
    data: object
    title?: string
}
  
export default function JsonViewSection({ data,title }: JsonViewSectionProps)  {
return (
    <div className="overflow-hidden rounded-2xl bg-muted p-2 ">               
        <div className="flex items-center justify-between">
            <h3 
                className="ml-4 h-10 text-lg flex items-center font-semibold text-gray-400 dark:text-gray-300">
                {title}
            </h3>
        </div>
        <div className="dark:bg-muted rounded-2xl">     
            <Primitive
                value={data}
                displayDataTypes={true}
                style={
                    {
                        "--w-rjv-color": "#9cdcfe",
                        "--w-rjv-key-number": "#268bd2",
                        "--w-rjv-key-string": "#9cdcfe",
                        "--w-rjv-background-color": "#1e1e1e",
                        "--w-rjv-line-color": "#36334280",
                        "--w-rjv-arrow-color": "#838383",
                        "--w-rjv-edit-color": "#9cdcfe",
                        "--w-rjv-info-color": "#9c9c9c7a",
                        "--w-rjv-update-color": "#9cdcfe",
                        "--w-rjv-copied-color": "#9cdcfe",
                        "--w-rjv-copied-success-color": "#28a745",
                        "--w-rjv-curlybraces-color": "#d4d4d4",
                        "--w-rjv-colon-color": "#d4d4d4",
                        "--w-rjv-brackets-color": "#d4d4d4",
                        "--w-rjv-ellipsis-color": "#cb4b16",
                        "--w-rjv-quotes-color": "#9cdcfe",
                        "--w-rjv-quotes-string-color": "#ce9178",
                        "--w-rjv-type-string-color": "#ce9178",
                        "--w-rjv-type-int-color": "#b5cea8",
                        "--w-rjv-type-float-color": "#b5cea8",
                        "--w-rjv-type-bigint-color": "#b5cea8",
                        "--w-rjv-type-boolean-color": "#569cd6",
                        "--w-rjv-type-date-color": "#b5cea8",
                        "--w-rjv-type-url-color": "#3b89cf",
                        "--w-rjv-type-null-color": "#569cd6",
                        "--w-rjv-type-nan-color": "#859900",
                        "--w-rjv-type-undefined-color": "#569cd6"} as React.CSSProperties
                    
                }
                collapsed={1}
            >
            </Primitive>
        </div>
        
    </div>
    )
  }
  


